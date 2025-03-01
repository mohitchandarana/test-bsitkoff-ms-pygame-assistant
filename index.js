(async function(codioIDE, window) {

  const VERSION = "1.1.0"; // Updated version number

  const systemPrompt = `You are a helpful assistant to a seventh grade student studying computer science for the first time. They are learning Python using PyGame Zero this year.

PyGame Zero is a simplified version of PyGame designed for beginners. In our classroom:
- We use "import pgzrun" at the top of files and call "pgzrun.go()" at the bottom to run games.
- WIDTH and HEIGHT constants must be defined in each program.
- Standard functions include:
    • draw(): renders the screen every frame
    • update(dt): updates the game state (dt is optional)
    • on_mouse_down(pos): handles mouse clicks
    • on_key_down(key): handles key presses.
- Actor objects (e.g., alien = Actor('alien')) are used for game elements and positioned via alien.pos or alien.x and alien.y.
- Collision detection methods include alien.collidepoint(pos) and actor.colliderect(other_actor).
- Images are stored in the 'images' folder.
- Screen methods such as screen.clear(), screen.draw.text(), and screen.fill() are used.
- Timing functions like clock.schedule() and clock.schedule_unique() control events.

IMPORTANT: Sound and music do not work in Codio due to our remote desktop setup.

When responding:
- Keep answers brief (no more than 250 words) at a middle school reading level.
- Use short code examples only to illustrate syntax or small bug fixes.
- Do not write complete games or assignment solutions.
- If questions fall outside of course content, politely state you can only answer questions about middle school computer science.
`;

  // Register the extension using the older working syntax.
  codioIDE.coachBot.register("iNeedHelpButton", "PyGame Questions", onButtonPress);

  async function onButtonPress() {
    console.log(`PyGame Zero Assistant v${VERSION} started`);
    codioIDE.coachBot.write(
      `PyGame Zero Assistant v${VERSION} - Ask me questions about PyGame Zero!`,
      codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT
    );

    let messages = [];

    while (true) {
      // Prompt with a hint for the student's question.
      const input = await codioIDE.coachBot.input("What's your PyGame Zero question?", "");
      
      if (input === "Thanks") break;
      if (input === "version") {
        codioIDE.coachBot.write(`Current version: ${VERSION}`, codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT);
        continue;
      }
      
      // Retrieve context and add debugging information.
      const context = await codioIDE.coachBot.getContext();
      console.log("Full context retrieved:", JSON.stringify(context, null, 2));

      // Debug: Log numbers of files and error messages separately.
      if (context && context.files) {
        console.log(`Found ${context.files.length} file(s) in context.`);
        context.files.forEach(file => {
          console.log(`File Name: ${file.name}`);
          if (file.content) {
            console.log(`File Content Preview: ${file.content.substr(0, 100)}...`); // preview first 100 characters
          }
        });
      } else {
        console.log("No files found in the context.");
      }
      
      if (context && context.error) {
        console.log("Error in context:", JSON.stringify(context.error, null, 2));
      } else {
        console.log("No error object found in context.");
      }
      
      // Build a simple JSON string for context for the prompt.
      const contextText = `Context:\n${JSON.stringify(context)}`;
      
      const userPrompt = `Here is the question the student asked:
<student_question>
${input}
</student_question>

${contextText}

Please answer following these guidelines:
- Keep your explanation brief and clear.
- Use code examples only to demonstrate syntax or correct small bugs.
- Do not write complete games or assignment solutions.
- Focus on explaining PyGame Zero concepts and reference any provided context if relevant.
`;
      
      messages.push({
        role: "user",
        content: userPrompt
      });
      
      const result = await codioIDE.coachBot.ask({
        systemPrompt: systemPrompt,
        messages: messages
      }, { preventMenu: true });
      
      messages.push({
        role: "assistant",
        content: result.result
      });
      
      // Keep conversation history manageable.
      if (messages.length > 10) {
        messages.splice(0, 2);
      }
    }
    
    codioIDE.coachBot.write("You're welcome! Please feel free to ask any more questions about PyGame Zero!", codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT);
    codioIDE.coachBot.showMenu();
  }

})(window.codioIDE, window);
