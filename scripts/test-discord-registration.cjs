// Offline setup-route checks. Every Discord API call is intercepted locally.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');

async function main() {
  const f = await fixture(5);
  f.c.Response = Response;
  f.c.URL = URL;
  f.c.TextEncoder = TextEncoder;
  const worker = vm.runInContext('workerExport', f.c);
  const commands = JSON.parse(JSON.stringify(vm.runInContext('DISCORD_COMMANDS', f.c)));
  assert.equal(commands.length, 38);
  for (const name of ['help', 'battle', 'cast', 'adventure']) {
    assert(commands.some(command => command.name === name));
  }
  for (const name of ['devlevel', 'devlevel2', 'devlevel3']) {
    assert(!commands.some(command => command.name === name));
  }
  assert(commands.every(command => !Object.hasOwn(command, 'contexts') &&
    !Object.hasOwn(command, 'integration_types') &&
    !Object.hasOwn(command, 'default_member_permissions')));

  const env = { ...f.env, SETUP_SECRET: 'offline-secret',
    DISCORD_APPLICATION_ID: '111111111111111111',
    DISCORD_GUILD_ID: '222222222222222222', DISCORD_BOT_TOKEN: 'offline-token' };
  const calls = [];
  f.c.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response('[]', { status: 200 });
  };
  const invoke = async (route, setupEnv = env, secret = 'offline-secret', method = 'POST') => {
    const request = new Request(`https://offline.invalid${route}`, {
      method, headers: secret === null ? {} : { 'X-Setup-Secret': secret },
    });
    return worker.fetch(request, setupEnv, {});
  };
  f.writes.length = 0;
  for (const route of ['/discord/register', '/discord/clear-guild-commands']) {
    for (const secret of [null, 'wrong-secret']) {
      const response = await invoke(route, env, secret);
      assert.equal(response.status, 401);
      assert.equal(await response.text(), 'Unauthorized.');
      assert.equal(calls.length, 0);
    }
    assert.equal((await invoke(route, { ...env, SETUP_SECRET: undefined })).status, 401);
    assert.equal((await invoke(route, env, 'offline-secret', 'GET')).status, 405);
    assert.equal(calls.length, 0);
  }
  const noGuild = { ...env, DISCORD_GUILD_ID: undefined };
  const globalResponse = await invoke('/discord/register', noGuild);
  assert.equal(globalResponse.status, 200);
  assert.equal((await globalResponse.json()).message,
    'Global Discord commands registered successfully.');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url,
    'https://discord.com/api/v10/applications/111111111111111111/commands');
  assert.equal(calls[0].options.method, 'PUT');
  assert.equal(calls[0].options.headers.Authorization, 'Bot offline-token');
  assert.deepEqual(JSON.parse(calls[0].options.body), commands);
  assert(!calls[0].url.includes('/guilds/'));

  const missingGuild = await invoke('/discord/clear-guild-commands', noGuild);
  assert.equal(missingGuild.status, 500);
  assert.match((await missingGuild.json()).error, /DISCORD_GUILD_ID/);
  assert.equal(calls.length, 1);
  const cleanupResponse = await invoke('/discord/clear-guild-commands');
  assert.equal(cleanupResponse.status, 200);
  assert.equal((await cleanupResponse.json()).message,
    'Guild commands cleared successfully.');
  assert.equal(calls.length, 2);
  assert.equal(calls[1].url,
    'https://discord.com/api/v10/applications/111111111111111111/guilds/222222222222222222/commands');
  assert.equal(calls[1].options.method, 'PUT');
  assert.equal(calls[1].options.body, '[]');
  assert.equal(calls[1].options.headers.Authorization, 'Bot offline-token');

  f.c.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response('private Discord error details', { status: 403 });
  };
  for (const route of ['/discord/register', '/discord/clear-guild-commands']) {
    const response = await invoke(route);
    assert.equal(response.status, 403);
    const result = await response.json();
    assert.equal(result.error, 'Discord command setup failed.');
    assert(!JSON.stringify(result).includes('private Discord error details'));
  }
  assert.equal(f.writes.length, 0);
  assert.equal(f.values.has('tip-jar:state'), false);
  console.log('PASS global registration, explicit guild cleanup, authentication, errors, command set, and KV isolation');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
