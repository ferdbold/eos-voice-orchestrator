import axios from 'axios';
import qs from 'qs';
import { env } from 'process';

async function main(args) {
  console.log('Authenticating to EOS...');
  let authResponse = null;

  try {
    const authBuffer = Buffer.from(`${env['client_id']}:${env['client_secret']}`, 'utf-8');
    const authorization = authBuffer.toString('base64');

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${authorization}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const data = qs.stringify({
      deployment_id: env['deployment_id'],
      grant_type: 'client_credentials'
    });

    authResponse = await axios.post('https://api.epicgames.dev/auth/v1/oauth/token', data, options);
  } catch (error) {
    console.log(error);
    throw new Error('Could not connect to EOS');
  };
  
  console.log('Authenticated to EOS');
  const accessToken = authResponse.data.access_token;

  if (args.RoomId === undefined) {
    console.log('RoomId was not supplied');
    throw new Error('RoomId was not supplied');
  }

  if (args.ProductUserId === undefined) {
    console.log('ProductUserId was not supplied');
    throw new Error('ProductUserId was not supplied');
  }

  if (args.ClientIp === undefined) {
    console.log('ClientIp was not supplied');
    throw new Error('ClientIp was not supplied');
  }

  const hardMuted = args.HardMuted || false;

  console.log(`Requesting token for voice room ${args.RoomId}...`);
  let roomResponse = null;
  try {
    const data = JSON.stringify({
      participants: [
        {
          'puid': args.ProductUserId,
          'clientIp': args.ClientIp,
          'hardMuted': hardMuted
        }
      ]
    });

    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    roomResponse = await axios.post(`https://api.epicgames.dev/rtc/v1/${env['deployment_id']}/room/${args.RoomId}`, data, options);
  } catch(error) {
    console.log(error);
    throw new Error('Could not fetch voice room token');
  };

  console.log('Room response:');
  console.log(roomResponse.data);

  return { body: roomResponse.data };
}

const _main = main;
export { _main as main };
