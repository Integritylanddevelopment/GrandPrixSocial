#!/usr/bin/env tsx

/**
 * Grand Prix Social - System Startup Script
 * Run this to initialize all systems and validate integration
 */

import SystemInitializationProtocol from '../lib/initialization/system-init-protocol'

async function main() {
  console.log('🏁 Grand Prix Social - System Startup')
  console.log('=' .repeat(60))
  
  const initProtocol = new SystemInitializationProtocol({
    environment: 'development',
    skipOptional: false,
    retryAttempts: 3,
    timeoutMs: 30000,
    components: {
      database: true,
      memory: true,
      agents: true,
      llm: true,
      apis: true
    }
  })

  try {
    const success = await initProtocol.initialize()
    
    if (success) {
      console.log('\n🎉 System startup completed successfully!')
      console.log('\n📱 Access Points:')
      console.log('  • Website: http://localhost:3000')
      console.log('  • Claude Interface: http://localhost:3000/claude-interface')
      console.log('  • Fantasy Dashboard: http://localhost:3000/fantasy')
      console.log('  • Race Schedule: http://localhost:3000/calendar')
      console.log('  • Docker LLM: http://localhost:11434')
      
      console.log('\n📋 Quick Test Commands:')
      console.log('  • npm run dev (if not already running)')
      console.log('  • curl http://localhost:11434/health (test LLM)')
      console.log('  • Check memory system: ls memory/')
      
      console.log('\n🏆 System Status: READY FOR DUTCH GRAND PRIX! 🇳🇱')
      
    } else {
      console.log('\n❌ System startup failed. Check logs above.')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n💥 Fatal startup error:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Graceful shutdown initiated...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n\n👋 System shutdown requested...')
  process.exit(0)
})

if (require.main === module) {
  main()
}