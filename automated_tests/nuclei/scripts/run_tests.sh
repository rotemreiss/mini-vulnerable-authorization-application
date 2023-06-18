#!/usr/bin/env bash

# Run our tests.
# Supports additional arguments to be passed to Nuclei.
nuclei -t ../templates -u $URL -var token_user=$TOKEN_USER -var token_admin=$TOKEN_ADMIN -json -silent -severity high "$@" > ../results.json

# Now generate the RBAC matrix
#python ./utils/rbac-matrix-generator.py -t ../templates -r ../results.json -o ../../rbac_matrix_ui/matrix.json

# Requires to set a local HTTP server as well.
# For example, with python -m http.server
#chrome-headless-render-pdf --include-background --url http://localhost:8000 --pdf ../rbac-matrix.pdf
