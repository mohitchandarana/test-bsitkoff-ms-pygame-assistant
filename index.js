(async function(codioIDE, window) {

  const VERSION = "1.1.1"; // Updated version number with guide integration
  const systemPrompt = `You are a helpful assistant to a seventh grade student studying computer science for the first time. They are learning Python using PyGame Zero this year.

PyGame Zero is a simplified version of PyGame designed for beginners. In our classroom:
- Use "import pgzrun" at the top and call "pgzrun.go()" at the bottom to run games.
- WIDTH and HEIGHT constants must be defined in each program.
- Standard functions include:
    • draw() to render the screen.
    • update(dt) to update the game state (dt is optional).
    • on_mouse_down(pos) to handle mouse clicks.
    • on_key_down(key) to handle key presses.
- Actor objects (e.g., alien = Actor('alien')) create game elements and are positioned via alien.pos or alien.x and alien.y.
- Use collision detection methods like alien.collidepoint(pos) and actor.colliderect(other_actor).
- Images are stored in the "images" folder.
- Screen methods include screen.clear(), screen.draw.text(), and screen.fill().
- Timing functions such as clock.schedule() and clock.schedule_unique() control events.

IMPORTANT: Sound and music do not work in Codio due to our remote desktop setup.

When answering:
- Keep responses brief (no more than 250 words) at a middle school reading level.
- Use code examples solely to illustrate syntax or correct small bugs.
- Do not write complete games or provide full assignment solutions.
- If the question is outside of course content, politely state you can only answer middle school computer science topics.

If guide content is available, please refer to it for assignment context.`;

  // Register using the older working method as before.
  codioIDE.coachBot.register("iNeedHelpButton", "PyGame Questions", onButtonPress);

  async function onButtonPress() {
    console.log(`PyGame Zero Assistant v${VERSION} started`);
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
      
      // Retrieve context and log details.
      const context = await codioIDE.coachBot.getContext();
      console.log("Full context retrieved:", JSON.stringify(context, null, 2));
      
      // Prefer guide content from context, but if empty, attempt to load a file manually.
      let guideContent = (context.guidesPage && context.guidesPage.content && context.guidesPage.content.trim().length > 0)
        ? context.guidesPage.content.trim()
        : "";
      
      if (!guideContent) {
        // Optionally load a guide file manually; adjust path as needed.
        try {
          const guidePath = ".guides/content/PyGame-Zero-898a.md"; // Modify this path to a valid guide file
          guideContent = await codioIDE.files.getContent(guidePath);
          console.log(`Loaded guide content from ${guidePath}`);
        } catch (e) {
          console.error("Error loading guide via Files API:", e);
          guideContent = "No guide available.";
        }
      }
      
      // Build the prompt: include the student's question and guide context.
      const userPrompt = `Here is the question the student asked:
<student_question>
${input}
</student_question>

Guide and Assignment Info:
${guideContent}

Please provide a focused response that helps the student understand PyGame Zero concepts.
Remember: no full assignment solutions or complete games—only concise explanations and syntax examples where needed.
`;
      
      messages.push({
        role: "user",
        content: userPrompt
      });
      
      const result = await codioIDE.coachBot.ask({
        systemPrompt: systemPrompt,
        messages: messages
      }, { preventMenu: true, stream: true, modelSettings: { temperature: 0.7, maxTokens: 1024 } });
      
      messages.push({
        role: codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT,
        content: result.result
      });
      
      // Maintain conversation history.
      if (messages.length > 10) {
        messages.splice(0, 2);
      }
    }
    
    codioIDE.coachBot.write("You're welcome! Feel free to ask more questions about PyGame Zero!", codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT);
    codioIDE.coachBot.showMenu();
  }

})(window.codioIDE, window);
