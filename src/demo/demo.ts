import * as T2 from "../textarea2";

T2.Textarea2.define();

const textarea2 = document.querySelector("textarea-2") as T2.Textarea2;

const completions: T2.AutoComplete[] = [
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
  new T2.AutocompletePlugin(completions),
  new T2.TabsPlugin(),
  new T2.FlipLinesPlugin(),
  new T2.FullLineEditsPlugin(),
  new T2.ListsPlugin()
);
