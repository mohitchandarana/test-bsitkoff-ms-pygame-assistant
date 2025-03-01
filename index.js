(async function(codioIDE, window) {

  const VERSION = "1.1.0"; // Updated version number

  const systemPrompt = `You are a helpful assistant to a seventh grade student studying computer science for the first time. They are learning Python using PyGame Zero this year.

PyGame Zero is a simplified version of PyGame designed for beginners. In our classroom setup:
- Use "import pgzrun" at the top and "pgzrun.go()" at the bottom to run games.
- Define the WIDTH and HEIGHT constants in each program.
- Standard functions include:
  * draw() - to render the screen each frame.
  * update(dt) - to update game state (dt is optional).
  * on_mouse_down(pos) - to handle mouse clicks.
  * on_key_down(key) - to handle keyboard presses.
- Actor objects create game elements (e.g., alien = Actor('alien')) and can be positioned with alien.pos or through alien.x and alien.y.
- Collision detection uses alien.collidepoint(pos) or actor.colliderect(other_actor).
- Images are stored in the 'images' folder.
- Screen methods include screen.clear(), screen.draw.text(), and screen.fill().
- Timing functions include clock.schedule() and clock.schedule_unique().
- Keyboard inputs use keys.LEFT, keys.SPACE, etc.
  
IMPORTANT: Sound and music do not work in Codio due to our remote desktop setup. Advise students to focus on other aspects of game development.

When students ask:
- Provide short, clear explanations with code examples if needed.
- Point out and suggest fixes for logic and syntax errors.
- Keep responses at or below 250 words.
- Avoid complete solutions for assignments.

If questions are out-of-scope, respond that you can only help with middle school computer science topics.`;

  // Register the extension with its id, name, and callback function.
  codioIDE.coachBot.register({
    id: "pygameZeroHelp",
    name: "PyGame Questions",
    callback: onButtonPress
  });

  async function onButtonPress() {
    console.log(`PyGame Zero Assistant v${VERSION} started`);

    // Welcome message using the assistant role.
    codioIDE.coachBot.write(
      `PyGame Zero Assistant v${VERSION} - Ask me questions about PyGame Zero!`,
      codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT
    );

    let messages = [];

    while (true) {
      // Prompt the student for their question.
      const input = await codioIDE.coachBot.input("What's your PyGame Zero question?", "");

      if (input === "Thanks") break;
      if (input === "version") {
        codioIDE.coachBot.write(`Current version: ${VERSION}`, codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT);
        continue;
      }

      // Fetch updated context from Codio.
      const context = await codioIDE.coachBot.getContext();
      let codeContent = "";
      let errorContent = "";

      if (context && context.files && Array.isArray(context.files)) {
        context.files.forEach(file => {
          if (file && file.content) {
            codeContent += `\nFile: ${file.name}\n\`\`\`python\n${file.content}\n\`\`\`\n`;
          }
        });
      }

      if (context && context.error && context.error.message) {
        errorContent = `\nCurrent Error:\n\`\`\`\n${context.error.message}\n\`\`\`\n`;
      }

      console.log(`Found ${context?.files?.length || 0} files in context`);
      if (codeContent) console.log("Extracted code content");
      if (errorContent) console.log("Found error content");

      // Build the prompt using the student question and context.
      const userPrompt = `Here is the question the student has asked:
<student_question>
${input}
</student_question>

I'm providing the current context from Codio:

${codeContent ? "STUDENT CODE:\n" + codeContent : "No code files found in the context."}

${errorContent ? "ERROR:\n" + errorContent : "No errors found in the context."}

${context && context.guidesPage && context.guidesPage.content ?
  "ASSIGNMENT INSTRUCTIONS:\n" + context.guidesPage.content :
  "No assignment instructions found in the context."}

Please carefully analyze all the context above before responding.
Keep answers brief and at a middle school reading level.
If there is code or an error in the context, reference it when relevant.
Do not ask for code that is already provided.`;

      // Add the student's prompt to the conversation history.
      messages.push({
        role: codioIDE.coachBot.MESSAGE_ROLES.USER,
        content: userPrompt
      });

      // Query the LLM using the built messages and system prompt.
      const result = await codioIDE.coachBot.ask({
        systemPrompt,
        messages
      }, { 
        preventMenu: true,
        stream: true,  // ensure streaming is supported in your environment
        modelSettings: {
          temperature: 0.7,
          maxTokens: 1024
        }
      });

      // Append the assistant's response to the conversation history.
      messages.push({
        role: codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT,
        content: result.result
      });

      // Maintain conversation history by removing older messages if needed.
      if (messages.length > 10) {
        messages.splice(0, 2);
      }
    }

    codioIDE.coachBot.write(
      "You're welcome! Please feel free to ask any more questions about PyGame Zero.",
      codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT
    );
    codioIDE.coachBot.showMenu();
  }

})(window.codioIDE, window);
