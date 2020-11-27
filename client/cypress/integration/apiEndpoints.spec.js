const url = "http://localhost:3000";

context("Student Page", () => {
  it("Login Test for Student Component", () => {
    cy.visit(url);
    cy.get("#username").type("mostafat");
    cy.get("#password").type("helloworld");
    cy.get("#login").click();
    cy.url().should("include", "/student/home");
    cy.get("h1").should("have.text", "Book Your Next Lectures");
    cy.get("#calendar").click();
    cy.url().should("include", "/student/calendar");
  });
});

// localhost:8080/API/REST.php/api/login
describe("todos API", () => {
  it("returns JSON", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:8080/API/REST.php/api/login",
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
      // const status = JSON.parse(response.body);
      expect(status).to.have.property("success", true);
      expect(status).to.have.property("userId", "5");
      expect(status).to.have.property("type", "0");
      // expect(status).to.have.property("success", "userId", "type");
      // expect(response.status).to.eq(200);
      // expect(response.body).to.have.length(500);
      // expect(response).to.have.property("body");
      // expect(response).to.have.property("duration");
    });
    // .its("headers")
    // .its("content-type")
    // .should("include", "application/json");
  });
});
