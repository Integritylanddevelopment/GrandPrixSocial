import { NextRequest, NextResponse } from 'next/server'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

interface QwenTrainingJob {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime: string
  endTime?: string
  exampleCount: number
  modelVersion: string
  trigger: string
  metrics?: {
    loss: number
    accuracy: number
    perplexity: number
  }
}

// Training job storage (in production, use database)
let trainingJobs: QwenTrainingJob[] = []
let currentModelVersion = '1.0'

/**
 * Qwen Model Training and Fine-tuning
 */
export async function POST(request: NextRequest) {
  try {
    const { action, exampleCount, trigger, trainingData } = await request.json()

    switch (action) {
      case 'update-model':
        return await startTrainingJob(exampleCount, trigger)
        
      case 'fine-tune':
        return await startFineTuning(trainingData)
        
      case 'export-modelfile':
        return await exportModelfile()
        
      case 'test-model':
        return await testModel()
        
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Use: update-model, fine-tune, export-modelfile, test-model'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Qwen training error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Training failed'
    }, { status: 500 })
  }
}

/**
 * Get training status and model information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('job-id')

    if (jobId) {
      const job = trainingJobs.find(j => j.id === jobId)
      
      if (!job) {
        return NextResponse.json({
          success: false,
          message: 'Training job not found'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        job
      })
    }

    // Return overall training status
    const activeJob = trainingJobs.find(j => j.status === 'running')
    const lastJob = trainingJobs.length > 0 ? trainingJobs[trainingJobs.length - 1] : null

    return NextResponse.json({
      success: true,
      system: {
        currentModelVersion,
        activeJob: activeJob ? {
          id: activeJob.id,
          status: activeJob.status,
          startTime: activeJob.startTime,
          exampleCount: activeJob.exampleCount
        } : null,
        lastTraining: lastJob ? {
          id: lastJob.id,
          status: lastJob.status,
          completedAt: lastJob.endTime,
          exampleCount: lastJob.exampleCount,
          trigger: lastJob.trigger
        } : null,
        totalJobs: trainingJobs.length
      },
      qwenConfig: {
        model: 'qwen2.5-coder:latest',
        customModelName: `grandprix-f1-qwen:${currentModelVersion}`,
        trainingCapabilities: [
          'Article generation fine-tuning',
          'Performance-based learning',
          'F1-specific context enhancement',
          'Writing style adaptation'
        ]
      }
    })

  } catch (error) {
    console.error('Training status error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Status check failed'
    }, { status: 500 })
  }
}

/**
 * Start a training job
 */
async function startTrainingJob(exampleCount: number, trigger: string): Promise<NextResponse> {
  const jobId = `qwen_${Date.now()}`
  const newVersion = getNextModelVersion()

  const job: QwenTrainingJob = {
    id: jobId,
    status: 'pending',
    startTime: new Date().toISOString(),
    exampleCount,
    modelVersion: newVersion,
    trigger
  }

  trainingJobs.push(job)
  console.log(`🎓 Starting Qwen training job: ${jobId}`)

  // Simulate training process (in real implementation, this would trigger actual training)
  setTimeout(async () => {
    await simulateTraining(jobId)
  }, 1000)

  return NextResponse.json({
    success: true,
    message: 'Qwen training job started',
    job: {
      id: jobId,
      status: 'pending',
      exampleCount,
      modelVersion: newVersion
    },
    estimatedDuration: '5-10 minutes'
  })
}

/**
 * Start fine-tuning with specific data
 */
async function startFineTuning(trainingData: any[]): Promise<NextResponse> {
  if (!trainingData || trainingData.length === 0) {
    return NextResponse.json({
      success: false,
      message: 'Training data required for fine-tuning'
    }, { status: 400 })
  }

  console.log(`🔬 Fine-tuning Qwen with ${trainingData.length} examples`)

  // Export training data to Qwen-compatible format
  const modelfile = await generateModelfile(trainingData)
  
  // In real implementation, this would:
  // 1. Create a new Ollama model with the training data
  // 2. Use `ollama create` with custom modelfile
  // 3. Train on the specific F1 examples

  return NextResponse.json({
    success: true,
    message: 'Fine-tuning initiated',
    modelfile,
    instructions: {
      step1: 'Save the modelfile as Modelfile',
      step2: 'Run: ollama create grandprix-f1-qwen:latest -f Modelfile',
      step3: 'Test with: ollama run grandprix-f1-qwen:latest',
      step4: 'Update QWEN_API_URL to use new model'
    }
  })
}

/**
 * Export Modelfile for Ollama
 */
async function exportModelfile(): Promise<NextResponse> {
  // Get best performing examples for training
  const response = await fetch('/api/ai/training-feedback?action=best-performing&limit=20')
  const data = await response.json()
  
  const trainingExamples = data.bestArticles || []
  const modelfile = await generateModelfile(trainingExamples)

  return NextResponse.json({
    success: true,
    modelfile,
    exampleCount: trainingExamples.length,
    instructions: 'Save as Modelfile and run: ollama create grandprix-f1-qwen:latest -f Modelfile'
  })
}

/**
 * Generate Ollama Modelfile with F1 training data
 */
async function generateModelfile(trainingExamples: any[]): Promise<string> {
  const systemPrompt = `You are an expert Formula 1 journalist writing for Grand Prix Social. You specialize in creating engaging, accurate, and exciting F1 content that resonates with racing fans. Your articles are known for:

- Exciting but professional tone
- Deep F1 technical knowledge  
- Engaging storytelling
- Accurate reporting with context
- Fan-focused perspective

Always write articles that F1 fans will love to read and share.`

  let modelfile = `FROM qwen2.5-coder:latest

SYSTEM """${systemPrompt}"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER repeat_penalty 1.1
`

  // Add training examples as few-shot examples
  for (let i = 0; i < Math.min(10, trainingExamples.length); i++) {
    const example = trainingExamples[i]
    
    modelfile += `
MESSAGE user """Transform this F1 news: "${example.sourceTitle}"

${example.sourceContent.substring(0, 500)}...

Category: ${example.category}
Write an engaging F1 article:"""

MESSAGE assistant """${example.generatedContent.substring(0, 1000)}..."""
`
  }

  return modelfile
}

/**
 * Test the current model
 */
async function testModel(): Promise<NextResponse> {
  const testPrompt = `Transform this F1 news into an engaging article:

TITLE: Max Verstappen Wins Championship
CATEGORY: race-analysis
LENGTH: medium
TONE: exciting

SOURCE: Max Verstappen secured his third consecutive Formula 1 World Championship after finishing second at the Qatar Grand Prix. The Red Bull driver needed only a few points to clinch the title.

Generate an exciting F1 article:`

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `grandprix-f1-qwen:${currentModelVersion}`,
        prompt: testPrompt,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Model test failed: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Model test completed',
      testPrompt,
      generatedContent: result.response,
      modelUsed: `grandprix-f1-qwen:${currentModelVersion}`
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Model test failed - ensure custom model is created',
      error: error instanceof Error ? error.message : 'Test failed',
      fallbackInstructions: 'Create custom model with: ollama create grandprix-f1-qwen:latest -f Modelfile'
    })
  }
}

/**
 * Simulate training process
 */
async function simulateTraining(jobId: string): Promise<void> {
  const job = trainingJobs.find(j => j.id === jobId)
  if (!job) return

  try {
    console.log(`🔄 Training job ${jobId} starting...`)
    job.status = 'running'

    // Simulate training duration
    await new Promise(resolve => setTimeout(resolve, 30000)) // 30 second simulation

    // Update job status
    job.status = 'completed'
    job.endTime = new Date().toISOString()
    job.metrics = {
      loss: Math.random() * 0.5 + 0.1, // 0.1-0.6
      accuracy: Math.random() * 0.2 + 0.8, // 0.8-1.0  
      perplexity: Math.random() * 20 + 10 // 10-30
    }

    currentModelVersion = job.modelVersion
    console.log(`✅ Training job ${jobId} completed! New model version: ${currentModelVersion}`)

  } catch (error) {
    console.error(`❌ Training job ${jobId} failed:`, error)
    job.status = 'failed'
    job.endTime = new Date().toISOString()
  }
}

/**
 * Get next model version
 */
function getNextModelVersion(): string {
  const current = parseFloat(currentModelVersion)
  return (current + 0.1).toFixed(1)
}