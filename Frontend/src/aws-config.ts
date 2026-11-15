
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_LZ1WQhUpU",
      userPoolClientId: "7vg27ftva60qlht7bnud75aa9q",
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: true,
        },
        birthdate: {
          required: true,
        },
      },
    },
  },
});
