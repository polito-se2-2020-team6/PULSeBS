import React from "react";
import Teacher from "../../components/Teacher";
import renderer from "react-test-renderer";


test("Fist SnapShot test ", () => {
  const tree = renderer.create(<Teacher />).toJSON();
  expect(tree).toMatchSnapshot();
});
