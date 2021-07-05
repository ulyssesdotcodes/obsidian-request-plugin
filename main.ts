import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, SuggestModal } from 'obsidian';

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
			name: 'GET Reqiest',
			editorCallback: (editor, view) => {
				new RequestModal(this.app, this.settings.urls, editor.getSelection()).open();
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
    selection: string;
    
	constructor(app: App, urls: string[], selection: string) {
		super(app);
		
		this.urls = urls;
		this.selection = selection;
	}
	
    getSuggestions(query: string) {
        return this.urls;
    }
    
    renderSuggestion(url: string, el: HTMLElement){
        el.innerHTML = url;
    }
    
    async onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
        fetch(item + this.selection).catch(err => );
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

		new Setting(containerEl)
			.setName('URLs')
			.setDesc('Targets for requests')
			.addText(text => text
				.setValue(this.plugin.settings.urls[0])
				.onChange(async (value) => {
					this.plugin.settings.urls[0] = value;
					await this.plugin.saveSettings();
				}));
	}
}
