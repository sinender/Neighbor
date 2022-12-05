// credit: @Arisings / Modified from original
import paginate from '../utils/pagination';
const InventoryBasic = Java.type("net.minecraft.inventory.InventoryBasic");
const GuiChest = Java.type("net.minecraft.client.gui.inventory.GuiChest");
NBTTagCompound = Java.type("net.minecraft.nbt.NBTTagCompound");

let border = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 18, 27, 36, 45, 17, 26, 35, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53]

let guiChest;
let items = [];

// get all the items for the select texture gui
const url = new java.net.URL("https://raw.githubusercontent.com/sinender/Neighbor/main/textures.txt");
let input = new java.io.BufferedReader(
    new java.io.InputStreamReader(url.openStream()));
let inputLine

while ((inputLine = input.readLine()) != null) {
    let i = String(inputLine.split(":")[1])
    let item = new Item(339)
    let stack = item.getItemStack();
    let nbt = stack.func_77978_p()
    let tag = new NBTTagCompound()
    tag.func_74778_a("texture", i)
    stack.func_77982_d(tag)
    item = new Item(stack).setName("&" + i[0] + "&" + i[1] + "&" + i[2] + "&r&a" + inputLine.split(":")[0]).setLore(["", "&eClick to select this texture."]);
    items.push(item)
}
input.close();
let page = 0;
let search;
const setTexture = register('command', (search) => {
    //check if the player is in creative
    if (!Player.asPlayerMP().player.field_71075_bZ.field_75098_d) {
        ChatLib.chat("&cYou must be in creative mode to use this command.")
        return
    }
    //check if the player is holding an item
    if (Player.getHeldItem() === null) {
        ChatLib.chat("&cYou must be holding an item to use this command.")
        return
    }
    page = 0
    this.search = search
    openGUI()
})
setTexture.setName('settexture');

function searchItems(search) {
    page = 0
    this.search = search
    Client.currentGui.close()
    openGUI()
}

function getSearch() {
    return search
}

function openGUI() {
    let inv = new InventoryBasic("Select Texture", true, 54); //creates a basic inventory with custom name nad 54 slots
    let newItems = items
    if (getSearch()) {
        newItems = items.filter(item => item.getName().toLowerCase().includes(search.toLowerCase()))
    }
    for (i of border) {
        inv.func_70299_a(i, new Item(160).setDamage(15).setName("&0").getItemStack())
    }
    inv.func_70299_a(49, new Item(166).setName("&cClose").getItemStack())
    if (Math.ceil(newItems.length / 28) > page + 1) {
        inv.func_70299_a(53, new Item(262).setName("&aNext Page").getItemStack())
    }
    if (page > 0) {
        inv.func_70299_a(45, new Item(262).setName("&aPrevious Page").getItemStack())
    }

    let actual = 0
    for (let i = 0; i < 54; i++) {
        if (!border.includes(i)) {
            if (paginate(newItems, page, 28)[actual] !== undefined) {
                inv.func_70299_a(i, paginate(newItems, page, 28)[actual].getItemStack())
                actual++
            }
        }
    }

    guiChest = new GuiChest(Player.getPlayer().field_71071_by, inv); //makes a chest out of the players inv and then new inventory
    //use this once to open the gui
    GuiHandler.openGui(guiChest)
}

register("guiMouseClick", (x, y, button, gui, event) => {
    if (Client.currentGui.get() === guiChest) {
        if (Client.currentGui.get().getSlotUnderMouse() === null) {
            cancel(event)
            return;
        }
        slot = Client.currentGui.get().getSlotUnderMouse().field_75222_d
        if (slot === 49) {
            Client.currentGui.close()
        }
        if (slot === 53 && Math.ceil(items.length / 28) > page + 1) {
            page++
            Client.currentGui.close()
            openGUI()
        }
        if (slot === 45 && page > 0) {
            page--
            Client.currentGui.close()
            openGUI()
        }
        let actual = 0
        let newItems = items
        if (getSearch()) {
            newItems = items.filter(item => item.getName().toLowerCase().includes(search.toLowerCase()))
        }
        for (let i = 0; i < 54; i++) {
            if (!border.includes(i)) {
                if (slot === i) {
                    let texture = paginate(newItems, page, 28)[actual].getItemStack().func_77978_p().func_74779_i("texture")
                    let item = Player.getHeldItem()
                    if (item.getName().match(/§[0-9A-FK-OR]§[0-9A-FK-OR]§[0-9A-FK-OR][a-zA-Z0-9 ]*/gi)) {
                        item.setName(item.getName().replace(/§[0-9A-FK-OR]§[0-9A-FK-OR]§[0-9A-FK-OR]/gi, "&" + texture[0] + "&" + texture[1] + "&" + texture[2]))
                    } else {
                        item.setName("&" + texture[0] + "&" + texture[1] + "&" + texture[2] + "&r" + item.getName())
                    }
                    ChatLib.chat("&aItem texture set to: " + paginate(newItems, page, 28)[actual].getName())

                }
                actual++
            }
        }
        cancel(event)
    }
});

register('guiKey', (char, keyCode, gui, event) => {
    cancelKeys = ['key.drop', 'key.hotbar.1']
    KeyBind = Client.getKeyBindFromKey(keyCode)
    if (Client.currentGui.get() === guiChest) {
        if (KeyBind?.getDescription()?.startsWith('key.hotbar.') || KeyBind?.getDescription() === 'key.drop') {
            cancel(event)
        }
    }
})

export function searchItems(search) {
    page = 0
    setSearch(search)
    Client.currentGui.close()
    openGUI()
}
export var getSearch = () => search
export var setSearch = (v) => search = v