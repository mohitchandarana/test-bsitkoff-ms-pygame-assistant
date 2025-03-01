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

  // Register the assistant using the older working syntax.
  codioIDE.coachBot.register("iNeedHelpButton", "PyGame Questions", onButtonPress);

  async function onButtonPress() {
    console.log(`PyGame Zero Assistant v${VERSION} started`);

    let messages = [];

    // Loop until student types "Thanks"
    while (true) {
      // Provide a prompt hint to the student.
      const input = await codioIDE.coachBot.input("What's your PyGame Zero question?", "");
      
      if (input === "Thanks") {
        break;
      }
      
      // Special command to check version.
      if (input === "version") {
        codioIDE.coachBot.write(`Current version: ${VERSION}`, codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT);
        continue;
      }
      
      // Fetch updated context as JSON.
      const context = await codioIDE.coachBot.getContext();
      
      // For simplicity, we include the context as a JSON string.
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
  
    codioIDE.coachBot.write("You're welcome! Please feel free to ask any more questions about PyGame Zero!");
    codioIDE.coachBot.showMenu();
  }

})(window.codioIDE, window);
