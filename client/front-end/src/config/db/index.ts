export const DBConfig = {
  name: 'VideoDB',
  version: 1,
  objectStoresMeta: [
    {
      store: 'videos',
      storeConfig: { keyPath: 'uuid', unique: true, autoIncrement: false },
      storeSchema: [
        { name: 'feature', keypath: 'feature', options: { unique: false } },
        { name: 'programming_language', keypath: 'programming_language', options: { unique: false } },
        { name: 'status', keypath: 'status', options: { unique: false } },
        { name: 'status_message', keypath: 'status_message', options: { unique: false } }
      ]
    }
  ]
}
