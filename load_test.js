import http from "k6/http";
import { sleep, data } from "k6";

const accessToken = "secret";

export default function () {
  const csvData = data.csv("exernal_students_accounts.csv");

  csvData.forEach((dataRow) => {
    const userExternalId = dataRow.userExternalId;
    const role = dataRow.role;
    const name = dataRow.name;
    const schoolClasses = JSON.parse(dataRow.schoolClasses);
    const provider = dataRow.provider;

    const query = `
      mutation {
        ExternalUserAutoLogin(
          userExternalId: "${userExternalId}",
          role: "${role}",
          name: "${name}",
          schoolClasses: ${JSON.stringify(schoolClasses)},
          provider: "${provider}"
        ) {
           token
        }
      }
    `;

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    http.post(
      "https://ecs-api-stage.jovensgenios.com:444/graphql",
      JSON.stringify({ query: query }),
      { headers: headers }
    );

    sleep(0.5);
  });
}

// check(response, {
//   "Status is 200": (r) => r.status === 200,
//   "Response body is not empty": (r) => r.body.length > 0,
// });
