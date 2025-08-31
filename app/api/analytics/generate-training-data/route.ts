import { NextRequest, NextResponse } from 'next/server'
import QwenTrainingGenerator from '@/lib/analytics/qwen-training-generator'

export async function POST(request: NextRequest) {
  try {
    const { minPerformanceScore = 70 } = await request.json()
    
    console.log('🧠 Generating training data for Qwen3...')
    
    const trainingGenerator = new QwenTrainingGenerator()
    const trainingExamples = await trainingGenerator.generateTrainingData(minPerformanceScore)
    
    return NextResponse.json({
      success: true,
      message: `Generated ${trainingExamples.length} training examples`,
      examples: trainingExamples.length,
      averageScore: trainingExamples.reduce((sum, ex) => sum + ex.trainingScore, 0) / trainingExamples.length
    })
    
  } catch (error) {
    console.error('Training data generation failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Export existing training data for fine-tuning
    const trainingGenerator = new QwenTrainingGenerator()
    const jsonlData = await trainingGenerator.exportForFineTuning()
    
    return new Response(jsonlData, {
      headers: {
        'Content-Type': 'application/jsonl',
        'Content-Disposition': 'attachment; filename="qwen3-f1-training-data.jsonl"'
      }
    })
    
  } catch (error) {
    console.error('Training data export failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'No training data available'
    }, { status: 500 })
  }
}