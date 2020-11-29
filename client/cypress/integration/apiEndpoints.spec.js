// const url = "http://localhost:3000";
const baseUr = "http://localhost:8080/API/REST.php/api";

describe("login API", () => {
  it("returns User", () => {
    cy.request({
      method: "POST",
      url: `${baseUr}/login`,
      form: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: {
        username: "mostafat",
        password: "helloworld",
      },
    }).then((response) => {
      const status = JSON.parse(JSON.stringify(response.body));
      expect(status).to.have.property("success", true);
      expect(status).to.have.property("userId", "5");
      expect(status).to.have.property("type", "0");
    });
  });
});
