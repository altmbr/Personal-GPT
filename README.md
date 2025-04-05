# My Personal GPT

A simple web application that allows you to interact with OpenAI's GPT models (GPT-4o and GPT-4.5) through a clean interface. Nice way to keep using 4.5 after you run out of credits (note dated April 5 2025).

## Features

- Choose between GPT-4o and GPT-4.5 models
- Chat-like interface for conversations
- Securely store your OpenAI API key in the browser
- Conversation history is maintained throughout the session
- Responsive design for desktop and mobile use

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up your OpenAI API key:
   - Rename `.env.example` to `.env`
   - Add your OpenAI API key to the `.env` file
   - OR enter your API key in the application interface

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. Select your preferred model (GPT-4o or GPT-4.5)
2. Type your message in the input box
3. Press "Send" or hit Enter to send your message
4. View the AI's response in the chat window
5. Continue the conversation as needed

## Security Note

- Your API key is stored locally in your browser's localStorage
- The key is never displayed once saved (shown as asterisks)
- You can remove your API key by clearing the input and clicking "Save API Key"

## Requirements

- Node.js v14 or later
- An OpenAI API key with access to GPT-4o and GPT-4.5 models
