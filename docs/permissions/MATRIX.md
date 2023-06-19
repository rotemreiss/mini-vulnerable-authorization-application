# APIs RBAC Matrix :key:

This page presents the permissions matrix of our API endpoints.

## Legend
- :red_circle: - Violation
- :white_check_mark: - Properly Configured

## RBAC (role-based-access-control) Matrix Table

| :car: Endpoint | :rainbow: HTTP Method |  :boy: user | :boy: admin |
| --- | --- | --- | --- |
| api/me | GET | Authorized :white_check_mark: | Authorized :white_check_mark: |
| api/admin | GET | Unauthorized :red_circle: | Authorized :white_check_mark: |
| api/product | POST | Unauthorized :red_circle: | Authorized :white_check_mark: |
| api/product | GET | Unauthorized :red_circle: | Authorized :white_check_mark: |
