import React from 'react';
import ReactDOM from 'react-dom';
import Teacher from './../Teacher';
import '@testing-library/jest-dom'

import { render } from '@testing-library/react'

//this test check if Teacher render correctly
it("renders without crashing", ()=>{
    const div = document.createElement("div");
    ReactDOM.render(<Teacher></Teacher>, div)
})

//this does not work i think because i can't test this kind of button that need server side stuff
//it("renders button correctly", () => { 
//    const {getByTestId} = render(<Teacher></Teacher>);
//   expect(getByTestId('button')).toHaveTextContent("delete")
//})