# Mini Vulnerable Authorization Application (mVAA)

[![Node.js CI](https://github.com/rotemreiss/mini-vulnerable-authorization-application/actions/workflows/run-tests.yml/badge.svg)](https://github.com/rotemreiss/mini-vulnerable-authorization-application/actions/workflows/run-tests.yml)

This is an intentionally vulnerable Node.js web application, designed to assist security enthusiasts, developers and students to train their automated tools to identify authorization (BOLA) vulnerabilities in a safe and legal environment.

:violin: The application was created as part of the demo for the talk
"The Missing Piece: Adding Automated RBAC Checks for Authorization in Your Pipelines" at [BSidesTLV 2023](https://bsidestlv.com/agenda/the_missing_piece__adding_automated_rbac_checks_for_authorization_in_your_pipelines/). 

## Disclaimer

mVAA is meant to be **legally** used by security professionals, developers and students for learning and testing purposes.
We strongly discourage any use of mVAA for malicious or illegal activities.
The maintainers of mVAA will not be responsible for any misuse of this application.

## Setup

1. Clone the repo.
2. Navigate into the repository directory: `cd mini-vulnerable-authorization-application`
3. Install dependencies: `npm install`
4. Create a `.env` file and set your secret key: `echo "SECRET_KEY=YourSecretKey" > .env`
5. Start the application: `npm start`

The application will be available at http://localhost:3000

## Fixed Application Feature Flag
You can run the fixed version of the application by setting the broken feature flag to false:
```
FEATURE_FLAG_BROKEN="false"
```

## Testing

To run the automated test cases, use the following command: `npm test`

## Contributing

Contributions, issues and feature requests are welcome. Feel free to check issues page if you want to contribute.

## Acknowledgements

Inspired by [DVWA](http://www.dvwa.co.uk/)

## License

This project is [MIT](LICENSE) licensed.
