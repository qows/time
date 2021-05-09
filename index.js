const { getModule, React } = require("powercord/webpack");
const { Plugin } = require("powercord/entities");
const { getState } = getModule(["getStatus"], false);
const updateRemoteSettings = getModule(["updateRemoteSettings"], false);
const Settings = require("./components/Settings");

module.exports = class DayNight extends Plugin {
    async startPlugin() {
        powercord.api.settings.registerSettings("day-night", {
            category: this.entityID,
            label: "Time",
            render: (props) =>
                React.createElement(Settings, {
                    createInterval: () => this.createInterval(),
                    cycle: () => this.cycle(),
                    ...props
                })
        });

        this.emojisCycle = [
            { emoji: "🌆", from: 6, to: 7 },
            { emoji: "🌇", from: 8, to: 11 },
            { emoji: "🏙️", from: 12, to: 17 },
            { emoji: "🌃", from: 18, to: 23 }
        ];

        this.createInterval();
    }

    createInterval() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(
            () => {
                this.cycle();
            },
            this.settings.get("timeText", false) ? 60000 : this.settings.get("rate", 60000)
        );
    }

    cycle() {
        const date = new Date();
        const hours = date.getHours();

        const emoji = this.emojisCycle.find((obj) => obj.from <= hours && obj.to >= hours);

        if (
            !this.settings.get("timeText", false) &&
            getState().activities?.[window.DiscordNative.crashReporter.getMetadata().user_id]?.[0].state === this.settings.get("statusText", "") &&
            getState().activities?.[window.DiscordNative.crashReporter.getMetadata().user_id]?.[0].emoji.name === emoji.emoji
        ) {
            return;
        } else {
            this.setStatus({
                emojiName: emoji.emoji,
                text: this.settings.get("timeText", false)
                    ? date.toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: this.settings.get("12format", false) })
                    : this.settings.get("statusText", "")
            });
        }
    }

    setStatus({ text, emojiName, emojiId }) {
        updateRemoteSettings.updateRemoteSettings({
            customStatus: {
                text,
                emojiName,
                emojiId
            }
        });
    }

    pluginWillUnload() {
        powercord.api.settings.unregisterSettings("day-night");
        clearInterval(this.interval);
    }
};
