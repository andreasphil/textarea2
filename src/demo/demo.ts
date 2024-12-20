import * as Plugins from "../plugins";
import { AutoComplete } from "../plugins/autocomplete";
import { Textarea2 } from "../textarea2";

Textarea2.define();

const textarea2 = document.querySelector("textarea-2") as Textarea2;

const completions: AutoComplete[] = [
  {
    trigger: "/",
    id: "slashcommand",
    commands: [
      {
        id: "example1",
        name: "Lion",
        icon: "🦁",
        initial: true,
        value: "Lion 🦁",
      },
      {
        id: "example2",
        name: "Bear",
        icon: "🧸",
        initial: true,
        value: "Bear 🧸",
      },
      { id: "example3", name: "Fish", icon: "🐟", value: "Fish 🐟" },
      { id: "example4", name: "Bird", icon: "🦆", value: "Bird 🦆" },
      { id: "example5", name: "Dog", icon: "🐕‍🦺", value: "Dog 🐕‍🦺" },
    ],
  },
];

textarea2!.use(
  new Plugins.AutocompletePlugin(completions),
  new Plugins.TabsPlugin(),
  new Plugins.FlipLinesPlugin(),
  new Plugins.FullLineEditsPlugin(),
  new Plugins.ListsPlugin()
);
