import React, { useState } from "react";
import {
  atom,
  useRecoilValue,
  useSetRecoilState,
  useRecoilState,
  selector,
} from "recoil";
import styled from "styled-components";
import { compose, flexbox, grid, space, layout, color } from "styled-system";

const Box = styled("div")(compose(flexbox, grid, space, layout, color));

const InputWrap = styled(Box)`
  border-bottom: 1px solid blue;
`;

const Input = styled(Box)`
  -webkit-appearance: none;
  border: 0;
  &:focus {
    outline: 0;
  }
`;

const Button = styled(Box)`
  -webkit-appearance: none;
  border: 0;
  cursor: pointer;
  border: 1px solid;
  border-radius: 50vw;
  &:hover,
  &:focus {
    transform: translateY(-1px);
    box-shadow: 0 0 4px blue;
  }
  &:focus {
    outline: 0;
  }
`;

const IconButton = styled(Box)`
  -webkit-appearance: none;
  border: 0;
  cursor: pointer;
`;

const Checkbox = styled(Box)`
  -webkit-appearance: none;
  border: 1px solid red;
  height: 16px;
  width: 16px;
  margin: 0;
  cursor: pointer;
  position: relative;
  &::after {
    content: "\\2713";
    position: absolute;
    text-align: center;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    color: #fff;
  }
  &:focus {
    outline: 0;
    box-shadow: 0 0 1px blue, 0 0 4px blue;
  }
  &:checked {
    background: red;
    &::after {
      opacity: 1;
    }
  }
`;

// Atoms contain the source of truth for application state
// https://recoiljs.org/docs/basic-tutorial/atoms
const todoListState = atom({
  key: "todoListState",
  default: [],
});

let id = 0;
function getId() {
  return id++;
}

function TodoItemCreator() {
  const [inputValue, setInputValue] = useState("");
  const setTodoList = useSetRecoilState(todoListState);
  const addItem = () => {
    setTodoList((oldTodoList: string[]) => [
      ...oldTodoList,
      {
        id: getId(),
        text: inputValue,
        isComplete: false,
      },
    ]);
    setInputValue("");
  };

  const onChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const onKeyPress = (event: any) => {
    if (event.key === "Enter") {
      addItem();
    }
  };

  return (
    <InputWrap mb={3} p={1}>
      <label>
        <Input
          as="input"
          placeholder="Create a new task"
          type="text"
          value={inputValue}
          onChange={onChange}
          onKeyPress={onKeyPress}
        />
      </label>
    </InputWrap>
  );
}

function replaceItemAtIndex(arr: string[], index: number, newValue: string) {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
}

function removeItemAtIndex(arr: string[], index: number) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

function TodoItem({ item }) {
  const [todoList, setTodoList] = useRecoilState(todoListState);
  const index = todoList.findIndex((listItem) => listItem === item);

  const editItemText = ({ target: { value } }) => {
    const newList = replaceItemAtIndex(todoList, index, {
      ...item,
      text: value,
    });

    setTodoList(newList);
  };

  const toggleItemCompletion = () => {
    const newList = replaceItemAtIndex(todoList, index, {
      ...item,
      isComplete: !item.isComplete,
    });

    setTodoList(newList);
  };

  const deleteItem = () => {
    const newList = removeItemAtIndex(todoList, index);

    setTodoList(newList);
  };

  return (
    <InputWrap my={2}>
      <Checkbox
        as="input"
        type="checkbox"
        checked={item.isComplete}
        onChange={toggleItemCompletion}
      />
      <Input
        ml={1}
        as="input"
        type="text"
        value={item.text}
        onChange={editItemText}
      />
      <IconButton as="button" onClick={deleteItem}>
        X
      </IconButton>
    </InputWrap>
  );
}

const todoListFilterState = atom({
  key: "todoListFilterState",
  default: "all",
});

// a selector represents a piece of derived state
// derived state can be thought of as the output of passing state to a pure function that modifies the given state in some way
// derived state is a powerful concept because it lets us build dynamic data that depends on other data
// from a component's point of view, selectors can be read using the same hooks that are used to read atoms
// it's important to note that certain hooks only work with writable state (selectors that have both a `get` and a `set` property)
// https://recoiljs.org/docs/basic-tutorial/selectors
const filteredTodoListState = selector({
  key: "filteredTodoListState",
  get: ({ get }) => {
    const filter = get(todoListFilterState);
    const list = get(todoListState);

    switch (filter) {
      case "completed":
        return list.filter((item: { isComplete: boolean }) => item.isComplete);
      case "active":
        return list.filter((item: { isComplete: boolean }) => !item.isComplete);
      default:
        return list;
    }
  },
});

function TodoListFilters() {
  const [, setFilter] = useRecoilState(todoListFilterState);

  return (
    <Box>
      <Button m={1} as="button" type="button" onClick={() => setFilter("all")}>
        All
      </Button>
      <Button
        m={1}
        as="button"
        type="button"
        onClick={() => setFilter("completed")}
        value="completed"
      >
        Completed
      </Button>
      <Button
        m={1}
        as="button"
        type="button"
        onClick={() => setFilter("active")}
        value="active"
      >
        Active
      </Button>
    </Box>
  );
}

const todoListStatsState = selector({
  key: "todoListStatsState",
  get: ({ get }) => {
    const todoList = get(filteredTodoListState);
    const totalNum = todoList.length;
    const totalCompletedNum = todoList.filter(
      (item: { isComplete: boolean }) => item.isComplete
    ).length;
    const totalUncompletedNum = totalNum - totalCompletedNum;
    const percentCompleted = totalNum === 0 ? 0 : totalCompletedNum / totalNum;

    return {
      totalNum,
      totalCompletedNum,
      totalUncompletedNum,
      percentCompleted,
    };
  },
});

function TodoListStats() {
  const { percentCompleted } = useRecoilValue(todoListStatsState);

  const formattedPercentCompleted = Math.round(percentCompleted * 100);

  return <span>Percent completed: {formattedPercentCompleted}</span>;
}

function TodoList() {
  // to read the contents of an atom, the useRecoilValue hook is used
  const todoList = useRecoilValue(filteredTodoListState);

  return (
    <Box display="grid" justifyItems="center" alignItems="center">
      <h1>My Tasks</h1>
      <TodoItemCreator />
      {todoList.map((todoItem: any[]) => (
        <TodoItem key={todoItem.id} item={todoItem} />
      ))}
      {todoList.length > 0 && (
        <Box display="flex" p={1} alignItems="center">
          <TodoListStats />
          <TodoListFilters />
        </Box>
      )}
    </Box>
  );
}

export default TodoList;
