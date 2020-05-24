import React from "react";
// RecoilRoot provides the context in which atoms have values
import { RecoilRoot } from "recoil";
import styled from "styled-components";
import TodoList from "./components/TodoList";

const Container = styled.div`
  color: blue;
`;

function App() {
  return (
    <RecoilRoot>
      <Container>Todo</Container>
      <TodoList />
    </RecoilRoot>
  );
}

export default App;
