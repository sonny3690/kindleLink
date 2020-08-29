import React, { useState } from "react";
import styled from "styled-components";
import ReactDOM from "react-dom";
import background from "../assets/background.png";

const Modal = styled.div`
  background: white;
  border-radius: 20px;
  margin: 40px auto 0px auto;
  justify-content: center;
  align-self: center;
  padding: 100px auto;
  width: 70vw;

  @media (max-width: 700px) {
    width: 80vw;
    margin: 30px auto auto auto;
  }
`;

const lightGray = "#d3d3d3";

const SexySubmitButton = styled.button`
  display: block;
  margin: 10px auto;
  font-size: 20px;
  border-radius: 20px;
  background: #ab7ad3;
  border-width: 0px;
  color: white;
  padding: 15px;
  box-shadow: 5px 9px 8px rgba(0, 0, 0, 0.25);
  transition: 0.3s ease-in-out;
  outline: none;

  &:hover {
    background: #c3a8ea;
  }

  &:focus {
    outline: 0;
  }
`;

const Input = styled.input`
  display: block;
  align-self: center;
  margin: 40px auto;
  width: 80%;
  font-size: 20px;
  border-radius: 15px;
  box-shadow: 0px 7px 16px rgba(0, 0, 0, 0.25);
  padding: 20px 15px;
  outline: none;
  border-width: 0px;
  textindent: 30px;
  transition: 0.3s ease-in-out;

  &:focus {
    box-shadow: 0px 7px 16px rgba(110, 225, 203, 0.5);
  }
`;

const Form = styled.div`
  margin: auto auto;
  align-content: center;
  align-self: center;
  justify-content: center;
`;

const SuperContainer = styled.div`
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100vh;
  padding: 30px 30px;
  background: url(${background});
`;

const validInput = (email: string, url: string) =>
  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) &&
  email.length > 0 &&
  url.length > 0;

const Stuff = () => {
  const [values, setValues] = useState({ email: "", url: "" });

  const changeValue = (key: string) => (event) =>
    setValues(Object.assign(values, { [key]: event.target.value }));
  const submit = () => {
    if (validInput(values.email, values.url)) {
      const req = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      };

      fetch("/", req)
        .then((r) => {
          alert(`Your book will be successfully sent to ${values.email}`);
          window.location.reload();
        })
        .catch((r) => {
          console.error(r);
          alert("Sorry, theres an issue with the server!");
          window.location.reload();
        });
    } else {
      alert("Your inputs dont make sense");
    }
  };

  return (
    <SuperContainer>
      <Modal>
        <div style={{ height: "10vh" }} />
        <h1>Kindle Book Sender</h1>

        <h4 style={{ marginTop: "5vh", color: lightGray }}>
          Email yourself a Kindle Book!
        </h4>
        <Form>
          <Input
            onChange={changeValue("url")}
            placeholder="Download URL for File"
          />
          <Input
            onChange={changeValue("email")}
            placeholder="Email receiving converted mobi file"
          />
          <SexySubmitButton onClick={submit}>
            Send Me That Shit
          </SexySubmitButton>
          <div style={{ height: "5vh" }} />
        </Form>
      </Modal>
    </SuperContainer>
  );
};

ReactDOM.hydrate(<Stuff />, document.getElementById("root"));
