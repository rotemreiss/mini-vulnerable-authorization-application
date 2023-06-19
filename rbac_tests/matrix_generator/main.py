import argparse
import os
import glob
import yaml
import json


def file_arg(path):
    # from os.path import exists
    if not os.path.isfile(path):
        raise ValueError  # or TypeError, or `argparse.ArgumentTypeError
    return path


def dir_arg(path):
    # from os.path import exists
    if not os.path.isdir(path):
        raise ValueError  # or TypeError, or `argparse.ArgumentTypeError
    return path


def get_templates(path):
    templates = list()

    try:
        for f in glob.glob(path + '/**/*.yaml', recursive=True):
            tpl_data = yaml.load(open(f), Loader=yaml.FullLoader)

            # Add only authorization related templates (according to Nuclei tagging).
            if "authorization" in tpl_data["info"]["tags"]:
                templates.append(tpl_data)

    except yaml.YAMLError as e:
        print(e)

    return templates


def generate_matrix(templates):
    matrix = {}
    roles = set()

    for tpl in templates:
        # Get the relevant data from the template.
        tpl_id = tpl["id"]
        severity = tpl["info"]["severity"]
        metadata = tpl["info"]["metadata"]

        # Extract the tested role from the template id.
        role = metadata["rbac-role"]
        roles.add(role)

        # We are making the assumption that there is only one request.
        method = metadata["rbac-method"]
        path = tpl["http"][0]["path"][0].replace('{{BaseURL}}/', '')

        # Create a unique identifier for this API endpoint.
        uniq_id = method + "--" + path

        ex_roles = matrix[uniq_id] if uniq_id in matrix else {}
        matrix[uniq_id] = {**ex_roles, **{role: {"is_allowed": severity == "info", "template_id": tpl_id}}}

    return {"roles": list(roles), "matrix": matrix}


def get_nuclei_violations(nuclei_results_path):
    violations = []

    nuclei_f = open(nuclei_results_path, 'r')
    nuclei_results = json.load(nuclei_f)

    for res in nuclei_results:
        violations.append(res["template-id"])

    # Closing file.
    nuclei_f.close()

    return violations


def create_markdown_page(json_data):
    # Header and basic information
    markdown = '''# APIs RBAC Matrix :key:

This page presents the permissions matrix of our API endpoints.

## Legend
- :x: - Check failed (violation)
- :white_check_mark: - Check passed (properly configured)

## RBAC (role-based-access-control) Matrix Table

| :car: Endpoint | :rainbow: HTTP Method | '''
    roles = json_data.get("roles", [])
    matrix = json_data.get("matrix", {})
    violations = json_data.get("violations", [])

    # Generating table headers for roles
    for role in roles:
        markdown += f' :boy: {role} | Result |'
    markdown += '\n| --- | --- |'
    markdown += ' --- |' * len(roles) * 2
    markdown += '\n'

    # Generating table rows
    for endpoint, access in matrix.items():
        endpoints_parts = endpoint.split("--")
        row = f'| {endpoints_parts[1]} | '
        row += f'{endpoints_parts[0]} |'
        for role in roles:
            if role in access:
                is_allowed = access[role].get("is_allowed", False)
                is_violation = access[role].get("template_id") in violations
                authorization_text = "Authorized" if is_allowed else "Unauthorized"
                authorization_emoji = ":x:" if is_violation else ":white_check_mark:"
                row += f' {authorization_text} | {authorization_emoji} |'
            else:
                row += ' MISSING |'
        markdown += row + '\n'

    return markdown


def main():
    parser = argparse.ArgumentParser(description='Remove URL pattern duplications..')

    # Add the arguments
    parser.add_argument('-t', '--templates',
                        help='The templates directory.',
                        type=dir_arg,
                        dest='templates_dir',
                        required=True)

    parser.add_argument('-r', '--results', help='File with Nuclei test results.',
                        type=file_arg,
                        dest='nuclei_results_path')
    parser.add_argument('-o', '--output', help='File to output the matrix JSON to.', dest='output')
    parser.add_argument('-om', '--output-markdown', help='File to output the matrix as Markdown.', dest='output_markdown')
    args = parser.parse_args()

    templates = get_templates(args.templates_dir)
    template_count = len(templates)

    output_data = {
        **generate_matrix(templates),
        **{"violations": get_nuclei_violations(args.nuclei_results_path) if args.nuclei_results_path else []}
    }

    if args.output:
        with open(args.output, 'w', encoding="utf-8") as outfile:
            json.dump(output_data, outfile)
    elif args.output_markdown:
        with open(args.output_markdown, 'w', encoding="utf-8") as outfile:
            outfile.write(create_markdown_page(output_data))
    else:
        print(json.dumps(output_data))


if __name__ == "__main__":
    main()
