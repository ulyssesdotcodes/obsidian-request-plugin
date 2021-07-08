import { settings } from 'cluster';
import { App, Editor, Modal, Notice, Plugin, PluginSettingTab, Setting, SuggestModal, TextComponent } from 'obsidian';

interface RequestPluginSettings {
    urls: string[];
}

const DEFAULT_SETTINGS: RequestPluginSettings = {
	urls: []
}

export default class RequestPlugin extends Plugin {
	settings: RequestPluginSettings;

	async onload() {

		await this.loadSettings();

		this.addCommand({
			id: 'get-request',
			name: 'GET',
			editorCallback: (editor, view) => {
				new RequestModal(this.app, this.settings.urls.filter(u => u), editor).open();
					return true;
			}
		});

		this.addSettingTab(new RequestSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class RequestModal extends SuggestModal<string> {
    urls: string[];
	editor: Editor;
    
	constructor(app: App, urls: string[], editor: Editor) {
		super(app);
		
		this.urls = urls;
		this.editor = editor;
	}
	
    getSuggestions(query: string) {
        return this.urls;
    }
    
    renderSuggestion(url: string, el: HTMLElement){
        el.innerHTML = url;
    }
    
    async onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
		this.editor.replaceSelection(
			await fetch(item + this.editor.getSelection())
				.then(res => res.json())
				.then(res => Array.isArray(res) ? res.join('\n') : res)
				.catch(err => console.error(err))
		);
    }
}

class RequestSettingTab extends PluginSettingTab {
	plugin: RequestPlugin;

	constructor(app: App, plugin: RequestPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		const setting = new Setting(containerEl)
			.setName('URLs')
			.setDesc('Targets for requests');

		setting.setClass('request-urls')

		this.plugin.settings.urls = this.plugin.settings.urls.filter(t => t);
		this.plugin.saveSettings();

		this.plugin.settings.urls.forEach((val, idx) =>
			setting.addText(text => text
				.setValue(this.plugin.settings.urls[idx])
				.onChange(async textVal => {
					this.plugin.settings.urls[idx] = textVal;
					await this.plugin.saveSettings();
				})));

		const addLine = () => {
			const idx = this.plugin.settings.urls.length;
			setting
				.addText(text => text
					.onChange(async (value) => {
						this.plugin.settings.urls[idx] = value;
						await this.plugin.saveSettings();
					}));
		}

		addLine();
		setting.addButton(btn => btn.setClass('add').setButtonText('add').onClick(() => addLine()))

	}
}
