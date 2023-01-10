// credit: @Arisings / Modified from original
import paginate from '../utils/pagination';
import loadItemstack from "../utils/loadItemstack";
const InventoryBasic = Java.type("net.minecraft.inventory.InventoryBasic");
const ItemStack = Java.type("net.minecraft.item.ItemStack")
const GuiChest = Java.type("net.minecraft.client.gui.inventory.GuiChest");
const Enchantment = Java.type("net.minecraft.enchantment.Enchantment");
const NBTTagInt = Java.type("net.minecraft.nbt.NBTTagInt");
const NBTTagString = Java.type("net.minecraft.nbt.NBTTagString");
NBTTagCompound = Java.type("net.minecraft.nbt.NBTTagCompound");
const C0EPacketClickWindow = Java.type('net.minecraft.network.play.client.C0EPacketClickWindow');
const clickedSlot = C0EPacketClickWindow.class.getDeclaredField('field_149552_b');
clickedSlot.setAccessible(true);
const C10PacketCreativeInventoryAction = Java.type('net.minecraft.network.play.client.C10PacketCreativeInventoryAction');
const slotId = C10PacketCreativeInventoryAction.class.getDeclaredField("field_149629_a");
slotId.setAccessible(true);


let border = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 18, 19, 27, 28, 36, 37, 46, 17, 26, 35, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53]

let guiChest;
let cataItems = new Map();
cataItems.set("Miscellaneous", [])
cataItems.set("Materials", [])
cataItems.set("Weapons", [])
cataItems.set("Tools", [])
cataItems.set("Armor", [])
cataItems.set("Seasonal", [])

// get all the items for the select texture gui
const url = new java.net.URL("https://raw.githubusercontent.com/sinender/Neighbor/main/newTextures.txt");
let inp = new java.io.BufferedReader(
    new java.io.InputStreamReader(url.openStream()));
let inputLine

while ((inputLine = inp.readLine()) != null) {
    let i = String(inputLine.split(":")[2])
    let item = new Item(339)
    let stack = item.getItemStack();
    let nbt = stack.func_77978_p()
    let tag = new NBTTagCompound()
    tag.func_74778_a("texture", i)
    stack.func_77982_d(tag)
    item = new Item(stack).setName("&" + i[0] + "&" + i[1] + "&" + i[2] + "&r&a" + inputLine.split(":")[1]).setLore(["&7Texture ID: &a" + i, "", "&eClick to select this texture."]);
    cataItems.get(inputLine.split(":")[0]).push(item)
}
inp.close();
let page = 0;
let category = null;
let search;

const setTexture = register('command', ...args => {
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
    let arg = args[0]
    if (args.length > 1) {
        arg = args.join(" ")
    }
    if (arg == null || arg == "" || Number.isNaN(parseInt(arg))) {
        page = 0
        search = arg
        if (arg != null) {
            setInput(search)
        }
        let contents = getItems()
        let inv = new InventoryBasic("Select Texture", true, 54);
        for (let i = 0; i < contents.length; i++) {
            inv.func_70299_a(i, contents[i])
        }
        guiChest = new GuiChest(Player.getPlayer().field_71071_by, inv); //makes a chest out of the players inv and then new inventory
        //use this once to open the gui
        GuiHandler.openGui(guiChest)
    } else if (arg.length <= 3) {
        let texture = arg
        let item = Player.getHeldItem()
        if (item.getName().match(/§[0-9A-FK-OR]§[0-9A-FK-OR]§[0-9A-FK-OR][a-zA-Z0-9 ]*/gi)) {
            item.setName(item.getName().replace(/§[0-9A-FK-OR]§[0-9A-FK-OR]§[0-9A-FK-OR]/gi, "&" + texture[0] + "&" + texture[1] + "&" + texture[2]))
        } else {
            item.setName("&" + texture[0] + "&" + texture[1] + "&" + texture[2] + "&r" + item.getName())
        }
        loadItemstack(item.itemStack, Player.getHeldItemIndex() + 36)
        ChatLib.chat("&aItem texture set to: " + texture)
    }
})
setTexture.setName('settexture', true);
setTexture.setAliases(['st'])


function getItems() {
    let inv = Array(54) //creates an array with 54 slots for an inventory
    let newItems = []
    if (category != null) {
        newItems = cataItems.get(category)
    } else {
        for (i of cataItems.values()) {
            newItems = newItems.concat(i)
        }
    }
    if (search != null && search != "") {
        newItems = newItems.filter(item => item.getName().toLowerCase().includes(search.toLowerCase()))
    }
    newItems.sort((a, b) => a.getName().localeCompare(b.getName()))
    for (i of border) {
        inv[i] = new Item(160).setDamage(15).setName("&0").getItemStack()
    }
    inv[49] = new Item(166).setName("&cClose").getItemStack()
    inv[0] = new Item(339).setName("&0&9&4&aMiscellaneous").setLore(["&7This category has items", "&7that don't fit any", "&7of the other categories.", "", "&eClick to open!"]).getItemStack()
    inv[9] = new Item(339).setName("&0&6&9&aMaterials").setLore(["&7This category has items", "&7that you would find", "&7as materials.", "", "&eClick to open!"]).getItemStack()
    inv[18] = new Item(339).setName("&0&5&4&aWeapons").setLore(["&7This category has items", "&7that you would find", "&7as weapons.", "", "&eClick to open!"]).getItemStack()
    inv[27] = new Item(339).setName("&0&1&4&aTools").setLore(["&7This category has items", "&7that you would find", "&7as tools.", "", "&eClick to open!"]).getItemStack()
    inv[36] = new Item(339).setName("&0&3&6&aArmor").setLore(["&7This category has items", "&7that you would find", "&7as armor.", "", "&eClick to open!"]).getItemStack()
    inv[45] = new Item(339).setName("&0&9&7&aSeasonal").setLore(["&7This category has items", "&7that you would find", "&7as seasonal.", "&cWill change fequently!", "", "&eClick to open!"]).getItemStack()

    for (i of [0, 9, 18, 27, 36, 45]) {
        let item = new Item(inv[i])
        if (item.getName().includes(category)) {
            let enchant = Enchantment.field_151370_z //luck of the sea
            inv[i].func_77966_a(enchant, 1)
            //hide enchant flag
            inv[i].func_77983_a("HideFlags", new NBTTagInt(1))
        }
    }
    if ((search != null && search != "") | category != null) {
        inv[48] = new Item(339).setName("&0&9&2&cReset").setLore(["&7This will clear search", "&7aswell as the category", "&7selected!", "", "&eClick to reset!"]).getItemStack()
    }
    if (Math.ceil(newItems.length / 24) > page + 1) {
        inv[53] = new Item(262).setName("&aNext Page").setLore(["&7(" + (page + 1) + "/" + Math.ceil(newItems.length / 24) + ")", "", "&eClick to turn page!"]).getItemStack()
    }
    if (page > 0) {
        inv[46] = new Item(262).setName("&aPrevious Page").setLore(["&7(" + (page + 1) + "/" + Math.ceil(newItems.length / 24) + ")", "", "&eClick to turn page!"]).getItemStack()
    }
    let pagez = paginate(newItems, page, 24)
    let actual = 0
    for (let i = 0; i < 54; i++) {
        if (!border.includes(i)) {
            if (pagez[actual] !== undefined) {
                inv[i] = pagez[actual].getItemStack()
                actual++
            }
        }
    }
    for (let i = 0; i < 54; i++) {
        if (!(inv[i] instanceof ItemStack)) {
            inv[i] = null
        }
    }
    return inv;
}

let clickEvent;
let map = new Map()

import { setInput } from "../gui/LoadActionGUI"
const guiTopField = net.minecraft.client.gui.inventory.GuiContainer.class.getDeclaredField('field_147009_r');
const guiLeftField = net.minecraft.client.gui.inventory.GuiContainer.class.getDeclaredField('field_147003_i');
const xSizeField = net.minecraft.client.gui.inventory.GuiContainer.class.getDeclaredField("field_146999_f")
const ySizeField = net.minecraft.client.gui.inventory.GuiContainer.class.getDeclaredField("field_147000_g")
guiTopField.setAccessible(true);
guiLeftField.setAccessible(true);
xSizeField.setAccessible(true);
ySizeField.setAccessible(true);
register("guiMouseClick", (x, y, button, gui, event) => {
    if (Client.currentGui.get() === guiChest) {
        if (y < guiTopField.get(Client.currentGui.get())) return;
        if (x < guiLeftField.get(Client.currentGui.get())) return;
        if (y > guiTopField.get(Client.currentGui.get()) + ySizeField.get(Client.currentGui.get())) return;
        if (x > guiLeftField.get(Client.currentGui.get()) + xSizeField.get(Client.currentGui.get())) return;
        let slot
        try {
            if (guiChest.getSlotUnderMouse()) {
                if (guiChest.getSlotUnderMouse().field_75222_d) {
                    slot = guiChest.getSlotUnderMouse().field_75222_d
                } else {
                    slot = guiChest.getSlotUnderMouse().field_75225_a
                }
            } else {
                if (guiChest.getSlotAtPosition(x, y).field_75222_d) {
                    slot = guiChest.getSlotAtPosition(x, y).field_75222_d
                } else {
                    slot = guiChest.getSlotAtPosition(x, y).field_75225_a
                }
            }
        } catch (e) {
            if (e instanceof TypeError) {
                try {
                    slot = Client.currentGui.get().field_147005_v
                } catch (e) {
                    slot = null
                }
            }
        }
        cancel(event)
        if (!slot) {
            slot = 0
        }
        if (slot === 49) {
            Client.currentGui.close()
            return
        }
        if (slot === 48) {
            search = null
            category = null
            page = 0
            setInput("")
            let inv = getItems()
            if (inv.length > 0) {
                guiChest.field_147002_h.func_75131_a(inv)
            }
            return
        }
        let newItems = []
        if (category != null) {
            newItems = cataItems.get(category)
        } else {
            for (i of cataItems.values()) {
                newItems = newItems.concat(i)
            }
        }
        if (search != null && search != "") {
            newItems = newItems.filter(item => item.getName().toLowerCase().includes(search.toLowerCase()))
        }
        if (slot === 53 && Math.ceil(newItems.length / 24) > page + 1) {
            page++
            let inv = getItems()
            if (inv.length > 0) {
                guiChest.field_147002_h.func_75131_a(inv)
            }
            return
        }
        if (slot === 46 && page > 0) {
            page--
            let inv = getItems()
            guiChest.field_147002_h.func_75131_a(inv)
            return
        }
        let inv = getItems()
        if (inv[slot] instanceof ItemStack) {
            let i = new Item(inv[slot])
            let name = i.getName()
            if (name === "§0") return

            if (slot == 0 || slot == 9 || slot == 18 || slot == 27 || slot == 36 || slot == 45) {
                name = ChatLib.removeFormatting(name)
                category = name
                page = 0
                inv = getItems()
                if (inv.length > 0) {
                    guiChest.field_147002_h.func_75131_a(inv)
                }
                return
            }

            let texture = inv[slot].func_77978_p().func_74779_i("texture")
            let item = Player.getHeldItem()
            if (item.getName().match(/§[0-9A-FK-OR]§[0-9A-FK-OR]§[0-9A-FK-OR][a-zA-Z0-9 ]*/gi)) {
                item.setName(item.getName().replace(/§[0-9A-FK-OR]§[0-9A-FK-OR]§[0-9A-FK-OR]/gi, "&" + texture[0] + "&" + texture[1] + "&" + texture[2]))
            } else {
                item.setName("&" + texture[0] + "&" + texture[1] + "&" + texture[2] + "&r" + item.getName())
            }
            loadItemstack(item.itemStack, Player.getHeldItemIndex() + 36)
            ChatLib.chat("&aItem texture set to: " + name)
        }
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

function searchItems(s) {
    search = s
    page = 0
    let inv = getItems()
    Client.currentGui.get().field_147002_h.func_75131_a(inv)
}

export { search, searchItems, category }