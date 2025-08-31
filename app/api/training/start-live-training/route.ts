import { NextResponse } from 'next/server'
import LiveTrainingScheduler from '@/lib/training/live-training-scheduler'

let trainingScheduler: LiveTrainingScheduler | null = null

export async function POST() {
  try {
    if (trainingScheduler) {
      return NextResponse.json({
        success: false,
        message: 'Live training is already running'
      })
    }

    trainingScheduler = new LiveTrainingScheduler()
    
    // Start the training loop (non-blocking)
    trainingScheduler.startLiveTraining().catch(console.error)
    
    return NextResponse.json({
      success: true,
      message: 'Live training scheduler started',
      info: 'Qwen3 will now continuously learn from user interactions'
    })

  } catch (error) {
    console.error('Failed to start live training:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!trainingScheduler) {
      return NextResponse.json({
        active: false,
        message: 'Live training not started'
      })
    }

    const stats = await trainingScheduler.getTrainingStats()
    
    return NextResponse.json({
      active: true,
      stats,
      message: 'Live training is active'
    })

  } catch (error) {
    return NextResponse.json({
      active: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}