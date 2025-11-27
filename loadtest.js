import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    // Normal Load
    { duration: '5s', target: 10 },
    { duration: '10s', target: 10 },

    //  Stress load
    { duration: '5s', target: 50 },
    { duration: '10s', target: 50 },

    { duration: '5s', target: 0 },
  ],
};

export default function () {
  const res = http.get('https://jsonplaceholder.typicode.com/posts/1');
  check(res, { 'status was 200': (r) => r.status == 200 });
  check(res, { 'transaction time < 500ms': (r) => r.timings.duration < 500 });
  sleep(1);
}