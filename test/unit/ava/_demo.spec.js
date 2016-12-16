import test from 'ava'

test('deom test', async t => {
    const func = Promise.resolve('resut')
    t.is(await func, 'resut')
})
