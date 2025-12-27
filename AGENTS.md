## TypeScript

### Never use `as` to "specify" types

`as` should only **narrow** types, not **specify** them.

#### ❌ Bad

```typescript
const result = someOperation() as ExpectedType
Object.fromEntries(entries) as Record<KeyType, ValueType>
```

#### ✅ Good

```typescript
array.reduce(
  (acc, item) => ({ ...acc, [item.id]: item }),
  {} as Record<string, Item>
)
```
