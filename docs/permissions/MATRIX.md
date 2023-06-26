# APIs RBAC Matrix :key:

This page presents the permissions matrix of our API endpoints.

## Legend
- :x: - Check failed (violation)
- :white_check_mark: - Check passed (properly configured)

## RBAC (role-based-access-control) Matrix Table

| :car: Endpoint | :rainbow: HTTP Method |  :boy: user | Result | :boy: admin | Result |
| --- | --- | --- | --- | --- | --- |
| api/admin | GET | Unauthorized | :x: | Authorized | :white_check_mark: |
| api/me | GET | Authorized | :white_check_mark: | Authorized | :white_check_mark: |
| api/product | POST | Unauthorized | :x: | Authorized | :white_check_mark: |
| api/product | GET | Authorized | :white_check_mark: | Authorized | :white_check_mark: |
