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

        # Extract the tested role from the template id.
        role = tpl_id.split("--")[-1]
        roles.add(role)

        # We are making the assumption that there is only one request.
        method = tpl["requests"][0]["method"]
        path = tpl["requests"][0]["path"][0].replace('{{BaseURL}}/', '')

        # Create a unique identifier for this API endpoint.
        uniq_id = method + "--" + path

        ex_roles = matrix[uniq_id] if uniq_id in matrix else {}
        matrix[uniq_id] = {**ex_roles, **{role: {"is_allowed": severity == "info", "template_id": tpl_id}}}

    return {"roles": list(roles), "matrix": matrix}


def get_nuclei_violations(nuclei_results_path):
    violations = []

    nuclei_f = open(nuclei_results_path, 'r')

    for res in nuclei_f:
        res_json = json.loads(res.strip())
        violations.append(res_json["templateID"])

    # Closing file.
    nuclei_f.close()

    return violations


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
    args = parser.parse_args()

    templates = get_templates(args.templates_dir)
    template_count = len(templates)

    output_data = {
        **generate_matrix(templates),
        **{"violations": get_nuclei_violations(args.nuclei_results_path) if args.nuclei_results_path else []}
    }

    if args.output:
        with open(args.output, 'w') as outfile:
            json.dump(output_data, outfile)
    else:
        print(json.dumps(output_data))


if __name__ == "__main__":
    main()
