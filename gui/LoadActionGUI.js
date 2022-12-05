import { Input, Button } from './GuiBuilder';
import {searchItems, getSearch} from '../commands/setTexture';

const button = new Button(0, 0, 0, 20, 'Confirm');

const input = new Input(0, 0, 0, 18);
input.setEnabled(false);
input.setText('Search Textures')
input.mcObject.func_146203_f(24) // set max length

register('guiRender', (x, y) => {
	if (!Player.getContainer()) return;
	if (!isInTextureGUI()) return;

	const guiTopField = net.minecraft.client.gui.inventory.GuiContainer.class.getDeclaredField('field_147009_r');
	const xSizeField = net.minecraft.client.gui.inventory.GuiContainer.class.getDeclaredField('field_146999_f');
	guiTopField.setAccessible(true);
	xSizeField.setAccessible(true);
	var chestGuiTop = guiTopField.get(Client.currentGui.get())
	var chestWidth = xSizeField.get(Client.currentGui.get())

	const margin = 5;
	const sizeDifference = 10;

	button.setWidth(chestWidth / 2 - sizeDifference);
	button.setX(Renderer.screen.getWidth() / 2 + sizeDifference);
	button.setY(chestGuiTop - button.getHeight() - margin + 1);

	input.setWidth(chestWidth / 2 + sizeDifference - margin);
	input.setX(Renderer.screen.getWidth() / 2 - input.getWidth() + sizeDifference - margin);
	input.setY(chestGuiTop - input.getHeight() - margin);

	button.render(x, y);
	input.render();
})

register('guiKey', (char, keyCode, gui, event) => {
	if (!Player.getContainer()) return;
	if (!isInTextureGUI()) return;

	input.mcObject.func_146195_b(true);
	if (input.mcObject.func_146206_l()) {
		input.mcObject.func_146201_a(char, keyCode);
		inputUpdate()
		if (keyCode !== 1) { // keycode for escape key
			cancel(event)
		}
		if (keyCode === 28) { // keycode for enter key
			cancel(event)
			button.setEnabled(false);
			ChatLib.chat("Searching for texture...");
			searchItems(input.getText())
	
			input.setSelectionEnd(0);
			input.setCursorPosition(0);
			input.setLineScrollOffset(0);
			input.setIsFocused(true);
			input.setText(input.getText());
	
			button.setText('Confirm');
			button.setEnabled(true);
		}
	}
})

function inputUpdate() {
	if (input.getText() === 'test') {
		button.setText('Test');
		button.setEnabled(true);
		return;
	}

	if (input.getText().length === 0) {
		button.setText('Paste');
		button.setEnabled(true);
	} else {
		button.setText('Confirm');
		button.setEnabled(true);
	}
}

register('guiMouseClick', (x, y, mouseButton) => {
	if (!Player.getContainer()) return;
	if (!isInTextureGUI()) return;

	input.mcObject.func_146192_a(x, y, mouseButton);
	if (x > input.getX() && x < input.getX() + input.getWidth() && y > input.getY() && y < input.getY() + input.getHeight()) {
		if (input.getText() === 'Search Textures') {
			input.setText('')
			input.setCursorPosition(0);
		}
		input.setEnabled(true);
	} else {
		input.setEnabled(false);
	}

	if (x > button.getX() && x < button.getX() + button.getWidth() && y > button.getY() && y < button.getY() + button.getHeight()) {
		if (button.getText() === 'Paste') {
			try {
				input.setText(java.awt.Toolkit.getDefaultToolkit().getSystemClipboard().getData(java.awt.datatransfer.DataFlavor.stringFlavor))
				World.playSound('random.click', 1, 1)
				inputUpdate();
			} catch (e) {
				console.log(e)
			}
			return;
		}
		World.playSound('random.click', 1, 1)
		button.setText('Getting Data...');
		button.setEnabled(false);
		searchItems(input.getText())

		input.setSelectionEnd(0);
		input.setCursorPosition(0);
		input.setLineScrollOffset(0);
		input.setIsFocused(false);
		input.setText(input.getText());

		button.setText('Confirm');
		button.setEnabled(true);
	}
})

register('guiClosed', (gui) => {
	if (gui.class.getName() !== 'net.minecraft.client.gui.inventory.GuiChest') return;

	const lowerChestField = gui.class.getDeclaredField('field_147015_w');
	lowerChestField.setAccessible(true);
	const lowerChest = lowerChestField.get(gui);

	const inventoryTitleField = net.minecraft.inventory.InventoryBasic.class.getDeclaredField('field_70483_a');
	inventoryTitleField.setAccessible(true);
	const inventoryTitle = inventoryTitleField.get(lowerChest);

	if (!inventoryTitle.match(/Select Texture/gi)) return;

	if (button.getText() === 'Error') {
		button.setEnabled(true);
		button.setText('Import');
	}
})

function isInTextureGUI() {
	const containerName = Player.getContainer().getName();
	if (Client.currentGui.getClassName() === "GuiEditSign") return
	if (Player.getContainer().getClassName() !== 'ContainerChest') return false;
	if (containerName.match(/Select Texture/gi)) return true;
	return false;
}
