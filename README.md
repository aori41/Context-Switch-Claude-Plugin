# 🧵 context-switch

You're deep in a task with Claude Code and suddenly wonder *"wait, what's a good free icon pack?"*

Asking in the same chat throws Claude off topic. Opening a new chat means losing your spot.

**context-switch** gives you a third option: take a little detour, then come right back.

```
> /side what's a good free icon pack?
  ...chat about icons as long as you want...
> /back
  ...and you're back where you were, nothing changed 🎉
```

## Install

In Claude Code:

```
/plugin marketplace add aori41/context-switch
/plugin install context-switch@context-switch
```

That's it. You'll need [Node.js](https://nodejs.org) 18+.

**Got the folder locally?** Point at it instead:

```
/plugin marketplace add /path/to/context-switch
/plugin install context-switch@context-switch
```

**Just want a quick try?** Load it for one session without installing:

```
claude --plugin-dir /path/to/context-switch
```

## Use it

| Type | What happens |
|---|---|
| `/side <question>` | Opens a side thread and asks your question |
| *(just keep typing)* | Everything goes to the side thread until you leave |
| `/back` | Back to where you were |
| `/threads` | See all your side threads |
| `/threads 2` | Hop back into thread #2, with its history still there |

**Bonus:** you can open a side thread *inside* a side thread. `/back` unwinds them one at a time.

## How does it work?

While you're in a side thread, your messages are quietly sent to a separate Claude session instead of the main one. You see the answers, and your main conversation never sees any of it.

Side answers show up as a "blocked by hook" message. That's normal: it's how they stay out of your main chat.

## Good to know

- Side threads start fresh, so they don't know what your main chat is about. Give them a bit of context if it matters.
- Thread history is saved in `~/.claude/context-switch/`.

## License

MIT.
