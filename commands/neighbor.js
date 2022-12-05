let neighborCommand = register("command", ...args => {
    let command;
    try {
        command = args[0].toLowerCase();
    } catch (e) {
        command = ['help', 1]
    }
    if (command == "help") {
        let page = parseInt(args[1])
        if (isNaN(page)) page = 1;
        if (page == 1) {
            ChatLib.chat(`&6-----------------------------------------------------`);
            ChatLib.chat(ChatLib.getCenteredText("&6Neighbor Commands (1/1)"))
            ChatLib.chat(ChatLib.getCenteredText('&7Basic Neighbor Commands'))
            ChatLib.chat('')
            ChatLib.chat('&6/neighbor help <page> &fView all the Neighbor commands.')
            ChatLib.chat('&6/settexture &fOpen a gui to select one of the textures available.')
            ChatLib.chat('')
            ChatLib.chat(`&6-----------------------------------------------------`);
        } else {
            ChatLib.chat("&cInvalid Page Number.");
        }
        return;
    }
    ChatLib.chat("&cInvalid Neighbor command. Type /neighbor help for a list of commands.");
})
neighborCommand.setName('neighbor');

neighborCommand.setTabCompletions((args) => {
	if (args.length === 1) return ['help'];
	return [];
})