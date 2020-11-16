import React from "react";
import LoginPage from "../../components/LoginPage";
import renderer from "react-test-renderer";

test("Fist SnapShot test ", () => {
  const tree = renderer.create(<LoginPage />).toJSON();
  expect(tree).toMatchSnapshot();
});
