import React from "react";
// RecoilRoot provides the context in which atoms have values
import { RecoilRoot } from "recoil";
import styled from "styled-components";
import TodoList from "./components/TodoList";

function App() {
  return (
    <RecoilRoot>
      <TodoList />
    </RecoilRoot>
  );
}

export default App;
