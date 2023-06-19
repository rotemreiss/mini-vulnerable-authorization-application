#!/usr/bin/env bash

# Get the absolute path of the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Get the required data to generate the templates.
read -p "Enter the HTTP method (e.g. GET): " http_method
read -p "Enter the API name (e.g. product): " api_name
read -p "Enter the API human readable name (e.g. Product): " api_human_name
read -p "Enter the API path without the leading slash (e.g. api/product): " api_path

# @todo Handle errors and make it all actually mandatory + add a verification question.

echo "[-] Creating the templates directory tree."
mkdir -p "$SCRIPT_DIR/../templates/$api_path"

echo "[-] Creating the templates."
for role in admin user
do
    tpl_path="$SCRIPT_DIR/../templates/${api_path}/${http_method}-${role}.yaml"
    cp "$SCRIPT_DIR/../base_templates/role-status-based.yaml" "$tpl_path"
    api_id=$(echo "$api_path" | tr '/' '-')
    echo "API ID is $api_id"

    # Now replace the placeholders in the template with the relevant values.
    sed -i '' -e "s%{{PLACEHOLDER_API_ID}}%${api_id}%" "$tpl_path"
    sed -i '' -e "s%{{PLACEHOLDER_ROLE}}%${role}%" "$tpl_path"
    sed -i '' -e "s%{{PLACEHOLDER_API_HUMAN_NAME}}%${api_human_name}%" "$tpl_path"
    sed -i '' -e "s%{{PLACEHOLDER_API_NAME}}%${api_name}%" "$tpl_path"
    sed -i '' -e "s%{{PLACEHOLDER_API_PATH}}%${api_path}%" "$tpl_path"
    sed -i '' -e "s%{{PLACEHOLDER_METHOD}}%${http_method}%" "$tpl_path"
    sed -i '' -e "s%{{PLACEHOLDER_ROLE_UC}}%$(echo $role | tr a-z A-Z)%" "$tpl_path"

    echo "[+] Template has been created for ${http_method}-${api_id}-${role}."
done
