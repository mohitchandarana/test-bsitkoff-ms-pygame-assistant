(async function(codioIDE, window) {
  
  const VERSION = "1.1.0"; // Updated version number
  
  const systemPrompt = `You are a helpful assistant to a seventh grade student studying computer science for the first time. They are learning Python using PyGame Zero this year.

PyGame Zero is a simplified version of PyGame designed for beginners. In our classroom setup:
- We use the import pgzrun at the top of files and pgzrun.go() at the bottom to run games (not using the pgzrun command)
- The WIDTH and HEIGHT constants need to be defined in each program
- Standard functions are:
  * draw() - runs every frame to render the screen
  * update(dt) - runs every frame to update game state (dt parameter is optional)
  * on_mouse_down(pos) - handles mouse clicks
  * on_key_down(key) - handles keyboard presses
- We use Actor objects to create game elements: alien = Actor('alien')
- Actor positioning: alien.pos = (x, y) or alien.x = X, alien.y = Y
- Collision detection: alien.collidepoint(pos) or actor.colliderect(other_actor)
- Images are stored in the 'images' folder
- Screen methods: screen.clear(), screen.draw.text(), screen.fill()
- Timing functions: clock.schedule(), clock.schedule_unique()
- Keyboard input uses keys.LEFT, keys.SPACE, etc.

IMPORTANT: Sound and music do not work in the Codio environment as we are using a remote desktop implementation.
Advise students to focus on other aspects of game development and to skip sound/music implementation.

You have access to the official PyGame Zero documentation. Here's some key information from the documentation:

Actor objects:
- Actors are created using Actor('image_name')
- They can be positioned using anchor points: topleft, topright, bottomleft, bottomright, midtop, midleft, midbottom, midright, center
- Example: alien = Actor('alien', center=(300, 300))
- Actors have attributes like .x, .y, .pos, .width, .height
- Actors can be rotated using .angle property
- Actors have methods like .draw(), .colliderect(other_actor), .collidepoint(pos), .distance_to(target), .angle_to(target)
- Actor transparency can be controlled with .opacity (0.0 to 1.0)

Screen drawing:
- screen.clear() - Reset the screen to black
- screen.fill((r,g,b)) - Fill screen with color
- screen.blit(image, (x,y)) - Draw image at position
- screen.draw.line(start, end, (r,g,b), width) - Draw a line
- screen.draw.circle(pos, radius, (r,g,b), width) - Draw circle outline
- screen.draw.filled_circle(pos, radius, (r,g,b)) - Draw filled circle
- screen.draw.rect(rect, (r,g,b), width) - Draw rectangle outline
- screen.draw.filled_rect(rect, (r,g,b)) - Draw filled rectangle
- screen.draw.text(text, pos, **kwargs) - Draw text with many formatting options
  * text formatting options include: fontname, fontsize, color, background, width, angle
  * positioning: topleft, topright, bottomleft, bottomright, midtop, midleft, midbottom, midright, center
  * special effects: owidth (outline), ocolor, shadow, alpha (transparency)

Clock and timing:
- clock.schedule(function, delay) - Schedule function after delay seconds
- clock.schedule_unique(function, delay) - Schedule function once
- clock.schedule_interval(function, interval) - Schedule function repeatedly
- clock.unschedule(function) - Cancel scheduled function calls

Animations:
- animate(object, tween='linear', duration=1, **targets) - Animate object properties
- Tween types: 'linear', 'accelerate', 'decelerate', 'accel_decel', 'in_elastic', 'out_elastic'

Keyboard and input:
- keyboard.left, keyboard.space, keyboard.a - Check if key is pressed
- keys.LEFT, keys.SPACE, keys.A - Key constants
- mouse.LEFT, mouse.RIGHT - Mouse button constants

Please explain the course content in a simple and appropriate manner for a grade 7 student. For questions you can answer, focus your response on explaining concepts clearly.

You can provide code examples to illustrate specific functions or mechanics when students ask how to implement something - for example, showing how to move a character with keyboard input or how to detect collisions. However, don't write complete games or complex implementations from scratch.

When students ask for help with a specific feature or function, provide brief, focused code examples that demonstrate the concept they're asking about. This helps them learn how to implement features while still requiring them to build the full game themselves.

If there are logic errors in their code, point them out and suggest how to fix them. If asked about a syntax error, you can provide direct corrections.

If asked about context outside of the course materials, respond by saying that you can only answer questions about middle school computer science. Keep responses brief and at a middle school reading level. Do not respond with more than 250 words at a time. For homework problems or graded assignments, help them understand the concepts but encourage them to develop their own solutions.`;

  // Use proper options for the register method based on the documentation
  codioIDE.coachBot.register({
    id: "pygameZeroHelp",
    name: "PyGame Questions",
    callback: onButtonPress
  });

  async function onButtonPress() {
    console.log(`PyGame Zero Assistant v${VERSION} started`);
    
    // Show version to user on startup using write method with MESSAGE_ROLES.ASSISTANT
    codioIDE.coachBot.write(`PyGame Zero Assistant v${VERSION} - Ask me questions about PyGame Zero!`, codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT);
    
    let messages = [];
    
    while (true) {
      // Use defaultText parameter to show a hint
      const input = await codioIDE.coachBot.input("What's your PyGame Zero question?", "");

      if (input === "Thanks") {
        break;
      }
      
      if (input === "version") {
        codioIDE.coachBot.write(`Current version: ${VERSION}`, codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT);
        continue; // Skip processing this as a regular question
      }
      
      // Fetch updated context each time to capture any changes
      const context = await codioIDE.coachBot.getContext();
      
      // Extract code from files for easier access
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
      
      // Log what we found (for debugging in browser console)
      console.log(`Found ${context?.files?.length || 0} files in context`);
      if (codeContent) console.log("Extracted code content");
      if (errorContent) console.log("Found error content");

      const userPrompt = `Here is the question the student has asked:
<student_question>
${input}
</student_question>

I'm providing you with the current context from the Codio environment:

${codeContent ? "STUDENT CODE:\n" + codeContent : "No code files found in the context."}

${errorContent ? "ERROR:\n" + errorContent : "No errors found in the context."}

${context && context.guidesPage && context.guidesPage.content ? 
  "ASSIGNMENT INSTRUCTIONS:\n" + context.guidesPage.content : 
  "No assignment instructions found in the context."}

Please carefully analyze any code and errors above before responding. Do not ask to see code that is already provided in the context.

Please provide a helpful response following these guidelines:
- Keep answers brief, clear and at a middle school reading level
- For implementation questions ("How do I...?"), provide short, focused code examples
- If code is available in the context, reference specific parts when relevant to the student's question
- If there are errors in the context, address them specifically and suggest corrections
- Remember that sound/music features don't work in Codio
- Avoid writing complete games or solutions to assignments`;

      // Add message to the conversation history
      messages.push({
        "role": codioIDE.coachBot.MESSAGE_ROLES.USER,
        "content": userPrompt
      });

      // Use the model settings and proper options from the documentation
      const result = await codioIDE.coachBot.ask({
        systemPrompt: systemPrompt,
        messages: messages
      }, { 
        preventMenu: true,
        stream: true,
        modelSettings: {
          temperature: 0.7,    // Balanced between creative and consistent
          maxTokens: 1024      // Reasonable response length
        }
      });

      // Add the assistant's response to the messages array using the proper role
      messages.push({ 
        "role": codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT, 
        "content": result.result 
      });

      // Keep the conversation history manageable
      if (messages.length > 10) {
        messages.splice(0, 2);
      }
    }

    codioIDE.coachBot.write("You're welcome! Please feel free to ask any more questions about this course!", codioIDE.coachBot.MESSAGE_ROLES.ASSISTANT);
    codioIDE.coachBot.showMenu();
  }

})(window.codioIDE, window);
