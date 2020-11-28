const url = "http://localhost:3000";

context("Home Page", () => {
  it("Login Page Test", () => {
    cy.visit(url);
    cy.focused().should("have.attr", "name", "username");
    cy.get("#password").should("have.attr", "name", "password");
    cy.get("#login").should("have.attr", "type", "submit");
  });
});

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

context("Teacher Page", () => {
  it("Login Test for Teacher Component", () => {
    cy.visit(url);
    cy.get("#username").type("marcot");
    cy.get("#password").type("passw1");
    cy.get("#login").click();
    cy.url().should("include", "/teacher/home");
  });
});
