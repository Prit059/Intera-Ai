const autocannon = require('autocannon');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const BACKEND_URL = 'http://localhost:8000';
const DURATION = 30; 

// Test different endpoints (Based on actual API_PATHS from frontend)
const testEndpoints = [
  // {
  //   path: '/api/auth/profile',
  //   method: 'GET',
  //   title: 'Auth Profile'
  // },
  {
    path: '/api/roadmap/getallroadmap',
    method: 'GET',
    title: 'Roadmap Endpoint'
  },
  {
    path: '/api/sessions/my-session',
    method: 'GET',
    title: 'Sessions Endpoint'
  },
  {
    path: '/api/quizzes/my-quiz',
    method: 'GET',
    title: 'Quiz Endpoint'
  },
  {
    path: '/api/AdAptitude',
    method: 'GET',
    title: 'AdAptitude Endpoint'
  },
  {
    path: '/api/Adquizzes',
    method: 'GET',
    title: 'AdQuiz Endpoint'
  },
  {
    path: '/api/Adquizzes/active',
    method: 'GET',
    title: 'AdQuiz Active Endpoint'
  },
  {
    path: '/api/AdAptitude/my/aptitudes',
    method: 'GET',
    title: 'My Aptitude'
  },
  {
    path: '/api/AdAptitude/attempts/user',
    method: 'GET',
    title: 'User Aptitude Attempt'
  }
];

// Helper function to get response latency metrics
function extractLatencyMetrics(result) {
  const latency = result.latency || {};
  return {
    minLatency: latency.min || 0,
    maxLatency: latency.max || 0,
    avgLatency: latency.mean || 0,
    p99Latency: latency.p99 || 0,
    p95Latency: latency.p95 || 0,
    p50Latency: latency.p50 || 0
  };
}

// Helper function to get system resource usage
function getSystemResources() {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  let totalIdle = 0;
  let totalTick = 0;
  
  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });
  
  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const cpuUsage = 100 - ~~(100 * idle / total);
  
  return {
    cpuUsage: cpuUsage,
    memoryUsed: (usedMem / (1024 * 1024)).toFixed(2) + ' MB',
    memoryFree: (freeMem / (1024 * 1024)).toFixed(2) + ' MB',
    memoryUsagePercent: ((usedMem / totalMem) * 100).toFixed(2) + '%',
    cpuCores: cpus.length
  };
}

async function runPerformanceTest(endpoint) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Testing: ${endpoint.title}`);
  console.log(`URL: ${BACKEND_URL}${endpoint.path}`);
  console.log(`Duration: ${DURATION}s | Connections: 10`);
  console.log(`${'='.repeat(70)}\n`);

  // Get initial system state
  const initialResources = getSystemResources();
  
  try {
    const result = await autocannon({
      url: `${BACKEND_URL}${endpoint.path}`,
      duration: DURATION,
      connections: 10,
      pipelining: 1,
      method: endpoint.method,
      timeout: 30000,
      setupClient: (client) => {
        client.on('response', (statusCode, resBytes, responseTime) => {
          // Response time tracking happens automatically
        });
      }
    });

    // Get final system state
    const finalResources = getSystemResources();

    // Extract metrics
    const latency = extractLatencyMetrics(result);
    const throughput = (result.requests.total / result.duration).toFixed(2);
    const errorRate = result.errors ? ((result.errors / result.requests.total) * 100).toFixed(2) : '0.00';

    // Display detailed results
    console.log(`\n📊 RESULTS FOR: ${endpoint.title}`);
    console.log(`${'─'.repeat(70)}`);
    
    // Throughput metrics
    console.log(`\n⚡ THROUGHPUT:`);
    console.log(`   Total Requests: ${result.requests.total}`);
    console.log(`   Duration: ${result.duration.toFixed(2)}s`);
    console.log(`   Requests/sec: ${throughput}`);
    console.log(`   Errors: ${result.errors || 0} (${errorRate}%)`);
    
    // Latency metrics
    console.log(`\n⏱️ RESPONSE TIME (LATENCY):`);
    console.log(`   Min Latency: ${latency.minLatency}ms`);
    console.log(`   Max Latency: ${latency.maxLatency}ms`);
    console.log(`   Avg Latency: ${latency.avgLatency.toFixed(2)}ms`);
    console.log(`   P50 Latency (median): ${latency.p50Latency}ms`);
    console.log(`   P95 Latency: ${latency.p95Latency}ms`);
    console.log(`   P99 Latency: ${latency.p99Latency}ms`);
    
    // Resource usage
    console.log(`\n💾 RESOURCE USAGE:`);
    console.log(`   CPU Usage: ${initialResources.cpuUsage}%`);
    console.log(`   Memory Used: ${initialResources.memoryUsed}`);
    console.log(`   Memory Free: ${initialResources.memoryFree}`);
    console.log(`   Memory Usage: ${initialResources.memoryUsagePercent}`);
    console.log(`   CPU Cores: ${initialResources.cpuCores}`);

    // Performance assessment
    console.log(`\n🎯 ASSESSMENT:`);
    let performanceStatus = '✅ GOOD';
    let issues = [];
    
    if (latency.avgLatency > 200) {
      performanceStatus = '⚠️ NEEDS OPTIMIZATION';
      issues.push(`High avg latency (${latency.avgLatency.toFixed(2)}ms > 200ms)`);
    }
    if (latency.p99Latency > 500) {
      issues.push(`High P99 latency (${latency.p99Latency}ms > 500ms)`);
    }
    if (errorRate > 2) {
      performanceStatus = '❌ POOR';
      issues.push(`High error rate (${errorRate}% > 2%)`);
    }
    if (parseFloat(initialResources.memoryUsagePercent) > 80) {
      issues.push(`High memory usage (${initialResources.memoryUsagePercent} > 80%)`);
    }
    if (throughput < 50) {
      issues.push(`Low throughput (${throughput} req/s < 50 req/s)`);
    }
    
    console.log(`   Status: ${performanceStatus}`);
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
    } else {
      console.log(`   ✅ No performance issues detected`);
    }
    
    console.log(`\n${'─'.repeat(70)}\n`);

    return {
      endpoint: endpoint.title,
      totalRequests: result.requests.total,
      duration: result.duration,
      throughput: parseFloat(throughput),
      errors: result.errors || 0,
      errorRate: parseFloat(errorRate),
      minLatency: latency.minLatency,
      maxLatency: latency.maxLatency,
      avgLatency: parseFloat(latency.avgLatency.toFixed(2)),
      p50Latency: latency.p50Latency,
      p95Latency: latency.p95Latency,
      p99Latency: latency.p99Latency,
      cpuUsage: initialResources.cpuUsage,
      memoryUsed: initialResources.memoryUsed,
      memoryPercent: parseFloat(initialResources.memoryUsagePercent)
    };
  } catch (error) {
    console.error(`❌ Error testing ${endpoint.title}:`, error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║        BACKEND PERFORMANCE TEST - COMPREHENSIVE ANALYSIS           ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Test Duration: ${DURATION} seconds per endpoint`);
  console.log(`Started at: ${new Date().toLocaleString()}`);
  console.log(`System: Node.js ${process.version}\n`);

  const results = [];

  for (const endpoint of testEndpoints) {
    const result = await runPerformanceTest(endpoint);
    if (result) {
      results.push(result);
    }
  }

  // Summary table
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                    COMPREHENSIVE SUMMARY                           ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');
  
  // Throughput Summary
  console.log('📊 THROUGHPUT METRICS:');
  console.table(results.map(r => ({
    'Endpoint': r.endpoint,
    'Requests': r.totalRequests,
    'Req/sec': r.throughput,
    'Duration (s)': r.duration,
    'Errors': r.errors,
    'Error %': r.errorRate + '%'
  })));

  // Latency Summary
  console.log('\n⏱️ RESPONSE TIME (LATENCY) METRICS:');
  console.table(results.map(r => ({
    'Endpoint': r.endpoint,
    'Min (ms)': r.minLatency,
    'Avg (ms)': r.avgLatency,
    'P50 (ms)': r.p50Latency,
    'P95 (ms)': r.p95Latency,
    'P99 (ms)': r.p99Latency,
    'Max (ms)': r.maxLatency
  })));

  // Resource Usage Summary
  console.log('\n💾 RESOURCE USAGE METRICS:');
  console.table(results.map(r => ({
    'Endpoint': r.endpoint,
    'CPU %': r.cpuUsage,
    'Memory': r.memoryUsed,
    'Memory %': r.memoryPercent
  })));

  // Aggregate statistics
  const totalRequests = results.reduce((sum, r) => sum + r.totalRequests, 0);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
  const avgThroughput = (totalRequests / totalDuration).toFixed(2);
  const avgLatency = (results.reduce((sum, r) => sum + r.avgLatency, 0) / results.length).toFixed(2);
  const avgP99 = (results.reduce((sum, r) => sum + r.p99Latency, 0) / results.length).toFixed(2);

  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                    AGGREGATE STATISTICS                           ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  console.log(`Total Requests Across All Tests: ${totalRequests}`);
  console.log(`Total Duration: ${totalDuration.toFixed(2)}s`);
  console.log(`Total Errors: ${totalErrors} (${((totalErrors / totalRequests) * 100).toFixed(2)}%)`);
  console.log(`Average Throughput: ${avgThroughput} req/s`);
  console.log(`Average Response Time: ${avgLatency}ms`);
  console.log(`Average P99 Latency: ${avgP99}ms`);

  // Performance recommendations
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                    RECOMMENDATIONS                                ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  const bottlenecks = results.filter(r => r.throughput < 100);
  const highLatency = results.filter(r => r.avgLatency > 200);
  const highErrors = results.filter(r => r.errorRate > 2);

  if (bottlenecks.length > 0) {
    console.log('🔴 BOTTLENECKS DETECTED (< 100 req/s):');
    bottlenecks.forEach(r => {
      console.log(`   • ${r.endpoint}: ${r.throughput} req/s`);
      console.log(`     → Optimize database queries, add indexing, or cache responses`);
    });
  }

  if (highLatency.length > 0) {
    console.log('\n🟡 HIGH LATENCY DETECTED (> 200ms):');
    highLatency.forEach(r => {
      console.log(`   • ${r.endpoint}: ${r.avgLatency}ms avg latency`);
      console.log(`     → Check slow database queries, optimize algorithms, use caching`);
    });
  }

  if (highErrors.length > 0) {
    console.log('\n🔴 HIGH ERROR RATE DETECTED (> 2%):');
    highErrors.forEach(r => {
      console.log(`   • ${r.endpoint}: ${r.errorRate}% error rate`);
      console.log(`     → Check server logs, database connections, and API implementation`);
    });
  }

  if (bottlenecks.length === 0 && highLatency.length === 0 && highErrors.length === 0) {
    console.log('✅ All endpoints performing within acceptable parameters!');
  }

  console.log(`\n\nCompleted at: ${new Date().toLocaleString()}\n`);

  process.exit(totalErrors > 0 && totalErrors > (totalRequests * 0.05) ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
