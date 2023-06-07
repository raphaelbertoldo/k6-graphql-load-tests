import http from "k6/http";
import { sleep } from "k6";
import papaparse from "https://jslib.k6.io/papaparse/5.1.1/index.js";
import { SharedArray } from "k6/data";

// not using SharedArray here will mean that the code in the function call (that is what loads and
// parses the csv) will be executed per each VU which also means that there will be a complete copy
// per each VU
const csvData = new SharedArray("another data name", function () {
  // Load CSV file and parse it using Papa Parse
  return papaparse.parse(open("./exernal_students_accounts.csv"), {
    header: true,
  }).data;
});

export let options = {
  stages: [
    { duration: "20s", target: 5, name: "Warm up" },
    { duration: "30s", target: 50, name: "Ramp up load" },
    { duration: "30s", target: 100, name: "Sustained load" },
  ],
};

export default function () {
  const account = csvData[Math.floor(Math.random() * csvData.length)];
  const url = "https://ecs-api-stage.jovensgenios.com:444/graphql";
  const body = JSON.stringify({
    operationName: null,
    variables: {
      userExternalId: account.userExternalId,
      role: account.role,
      name: account.name,
      schoolClasses: JSON.parse(account.schoolClasses),
      provider: account.provider,
    },
    query:
      "mutation ExternalAPILogin($userExternalId: String!, $role: String!, $name: String, $schoolClasses: [String], $provider: String){ ExternalUserAutoLogin(  userExternalId: $userExternalId   role: $role name: $name schoolClasses: $schoolClasses provider: $provider) {   message }}",
  });
  const params = {
    headers: {
      authorization: "Bearer secret",
      "content-type": "application/json",
    },
  };
  http.post(url, body, params);
  sleep(0.5);
}
