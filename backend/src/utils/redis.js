import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'ckYEd7BOJbDWnN0IKCBHfTy0SafwIFiv',
    socket: {
        host: 'redis-11934.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 11934,
        // tls: true
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result)  // >>> bar

export default client;