import React, { useState } from 'react';
import styled from 'styled-components'
import ReactDOM from 'react-dom';

const SexySubmitButton = styled.button`
  display: block;
  margin: 30px auto;
  font-size: 20px;
  border-radius: 5px; 
  background: white;
`;


const Input = styled.input`
 display: block;
 align-self: center; 
 margin: 40px auto;
 width: 80%;
 font-size: 20px;
 border-radius: 15px;
 padding: 10px 15px;
 outline: none;
 textIndent: 30px;

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
`;

const validInput = (email: string, url: string) => (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) && email.length > 0 && url.length > 0)


const Stuff = () => {

  const [values, setValues] = useState({ email: '', url: '' })

  const changeValue = (key: string) => (event) => setValues(Object.assign(values, { [key]: event.target.value }))
  const submit = async () => {
    if (validInput(values.email, values.url)) {
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      }

      try {
        await fetch('/', req)
        alert(`Your book will be successfully sent to ${values.email}`)
      } catch (err) {
        console.error(err)
        alert('Sorry, theres an issue with the server!')
      } finally {
        window.location.reload();
      }
    } else {
      alert('Your inputs dont make sense')
    }

  }

  return (

    <SuperContainer>
      <div style={{ height: '10vh' }} />
      <h1>Kindle Book Emailer</h1>

      <div style={{ height: '10vh' }} />
      <h4>Copy Paste a Link and An Email And Your Book Will Be Sent!</h4>
      <Form>
        <Input onChange={changeValue('url')} placeholder='Book URL' on />
        <Input onChange={changeValue('email')} placeholder='Your Email Here' />
        <SexySubmitButton onClick={submit}>Send me that shit</SexySubmitButton>
      </Form>

    </SuperContainer >

  )
}



ReactDOM.hydrate(<Stuff />, document.getElementById('root'))

