import { createClient } from '@supabase/supabase-js'

// Cognitive Memory Architecture - Base Classes
export class CognitiveMemoryBase {
  protected supabase: any
  protected agentName: string

  constructor(agentName: string) {
    this.agentName = agentName
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
  }

  protected async logMemoryAccess(
    memoryType: string,
    memoryId: string,
    accessType: 'read' | 'write' | 'update' | 'query',
    queryContext?: string
  ) {
    const startTime = Date.now()
    
    try {
      await this.supabase.from('memory_access_log').insert({
        accessor: this.agentName,
        memory_type: memoryType,
        memory_id: memoryId,
        access_type: accessType,
        query_context: queryContext,
        response_time_ms: Date.now() - startTime
      })
    } catch (error) {
      console.error('Failed to log memory access:', error)
    }
  }
}

// ================================
// SEMANTIC MEMORY - Active Storage
// ================================
export class SemanticMemory extends CognitiveMemoryBase {
  constructor(agentName: string) {
    super(agentName)
  }

  // Get definition of a concept
  async getConceptDefinition(concept: string): Promise<any> {
    await this.logMemoryAccess('semantic', concept, 'read', `get_definition_${concept}`)
    
    const { data, error } = await this.supabase
      .from('semantic_definitions')
      .select('*')
      .eq('concept', concept.toLowerCase())
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error getting concept definition:', error)
      return null
    }
    
    return data
  }

  // Store new concept definition
  async storeConceptDefinition(
    concept: string,
    definition: string,
    category: string,
    domain: string,
    context?: any,
    examples?: string[]
  ): Promise<boolean> {
    await this.logMemoryAccess('semantic', concept, 'write', `store_definition_${concept}`)
    
    const { error } = await this.supabase
      .from('semantic_definitions')
      .upsert({
        concept: concept.toLowerCase(),
        definition,
        category,
        domain,
        context: context || {},
        examples: examples || [],
        updated_at: new Date().toISOString(),
        created_by: this.agentName
      })
    
    if (error) {
      console.error('Error storing concept definition:', error)
      return false
    }
    
    return true
  }

  // Get related concepts
  async getRelatedConcepts(concept: string, relationshipType?: string): Promise<any[]> {
    await this.logMemoryAccess('semantic', concept, 'query', `related_concepts_${concept}`)
    
    let query = this.supabase
      .from('semantic_relationships')
      .select(`
        target_concept,
        relationship_type,
        strength,
        semantic_definitions!target_concept (definition, category, domain)
      `)
      .eq('source_concept', concept.toLowerCase())
    
    if (relationshipType) {
      query = query.eq('relationship_type', relationshipType)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error getting related concepts:', error)
      return []
    }
    
    return data || []
  }

  // Store relationship between concepts
  async storeConceptRelationship(
    sourceConcept: string,
    targetConcept: string,
    relationshipType: string,
    strength: number = 1.0,
    bidirectional: boolean = false
  ): Promise<boolean> {
    await this.logMemoryAccess('semantic', `${sourceConcept}_${targetConcept}`, 'write', 'store_relationship')
    
    const { error } = await this.supabase
      .from('semantic_relationships')
      .upsert({
        source_concept: sourceConcept.toLowerCase(),
        target_concept: targetConcept.toLowerCase(),
        relationship_type: relationshipType,
        strength,
        bidirectional
      })
    
    if (error) {
      console.error('Error storing concept relationship:', error)
      return false
    }
    
    return true
  }

  // Query concepts by domain or category
  async queryConceptsByDomain(domain: string): Promise<any[]> {
    await this.logMemoryAccess('semantic', domain, 'query', `concepts_by_domain_${domain}`)
    
    const { data, error } = await this.supabase
      .from('semantic_definitions')
      .select('*')
      .eq('domain', domain)
    
    if (error) {
      console.error('Error querying concepts by domain:', error)
      return []
    }
    
    return data || []
  }

  // Get concept hierarchy
  async getConceptHierarchy(parentConcept: string): Promise<any[]> {
    await this.logMemoryAccess('semantic', parentConcept, 'query', `hierarchy_${parentConcept}`)
    
    const { data, error } = await this.supabase
      .from('concept_hierarchy')
      .select(`
        child_concept,
        hierarchy_type,
        level,
        semantic_definitions!child_concept (definition, category, domain)
      `)
      .eq('parent_concept', parentConcept.toLowerCase())
      .order('level')
    
    if (error) {
      console.error('Error getting concept hierarchy:', error)
      return []
    }
    
    return data || []
  }
}

// ================================
// PROCEDURAL MEMORY - Active Storage
// ================================
export class ProceduralMemory extends CognitiveMemoryBase {
  constructor(agentName: string) {
    super(agentName)
  }

  // Get procedures for this agent
  async getAgentProcedures(): Promise<any[]> {
    await this.logMemoryAccess('procedural', this.agentName, 'read', 'get_agent_procedures')
    
    const { data, error } = await this.supabase
      .from('agent_procedures')
      .select('*')
      .eq('agent_name', this.agentName)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
    
    if (error) {
      console.error('Error getting agent procedures:', error)
      return []
    }
    
    return data || []
  }

  // Store/update procedure for this agent
  async storeProcedure(
    procedureName: string,
    description: string,
    steps: any[],
    inputRequirements?: any,
    outputResults?: any,
    conditions?: any
  ): Promise<boolean> {
    await this.logMemoryAccess('procedural', `${this.agentName}_${procedureName}`, 'write', 'store_procedure')
    
    // Get current version number
    const { data: existing } = await this.supabase
      .from('agent_procedures')
      .select('version')
      .eq('agent_name', this.agentName)
      .eq('procedure_name', procedureName)
      .order('version', { ascending: false })
      .limit(1)
    
    const version = existing && existing.length > 0 ? existing[0].version + 1 : 1
    
    const { error } = await this.supabase
      .from('agent_procedures')
      .insert({
        agent_name: this.agentName,
        procedure_name: procedureName,
        procedure_description: description,
        steps,
        input_requirements: inputRequirements || {},
        output_results: outputResults || {},
        conditions: conditions || {},
        version,
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error storing procedure:', error)
      return false
    }
    
    return true
  }

  // Get specific procedure
  async getProcedure(procedureName: string): Promise<any> {
    await this.logMemoryAccess('procedural', `${this.agentName}_${procedureName}`, 'read', 'get_procedure')
    
    const { data, error } = await this.supabase
      .from('agent_procedures')
      .select('*')
      .eq('agent_name', this.agentName)
      .eq('procedure_name', procedureName)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
    
    if (error) {
      console.error('Error getting procedure:', error)
      return null
    }
    
    return data && data.length > 0 ? data[0] : null
  }

  // Record procedure execution
  async recordExecution(
    procedureId: string,
    inputData?: any,
    episodeId?: string
  ): Promise<string> {
    const executionId = crypto.randomUUID()
    
    await this.logMemoryAccess('procedural', procedureId, 'write', 'record_execution_start')
    
    const { error } = await this.supabase
      .from('procedure_executions')
      .insert({
        id: executionId,
        procedure_id: procedureId,
        agent_name: this.agentName,
        status: 'running',
        input_data: inputData || {},
        episode_id: episodeId
      })
    
    if (error) {
      console.error('Error recording procedure execution:', error)
    }
    
    return executionId
  }

  // Complete procedure execution
  async completeExecution(
    executionId: string,
    status: 'completed' | 'failed' | 'cancelled',
    outputData?: any,
    errors?: any,
    performanceMetrics?: any
  ): Promise<boolean> {
    await this.logMemoryAccess('procedural', executionId, 'update', 'complete_execution')
    
    const { error } = await this.supabase
      .from('procedure_executions')
      .update({
        execution_end: new Date().toISOString(),
        status,
        output_data: outputData || {},
        errors: errors || {},
        performance_metrics: performanceMetrics || {}
      })
      .eq('id', executionId)
    
    if (error) {
      console.error('Error completing procedure execution:', error)
      return false
    }
    
    return true
  }
}

// ================================
// EPISODIC MEMORY - Active Storage  
// ================================
export class EpisodicMemory extends CognitiveMemoryBase {
  private currentEpisodeId: string | null = null

  constructor(agentName: string) {
    super(agentName)
  }

  // Start new episode
  async startEpisode(
    episodeName: string,
    episodeType: string,
    context?: any,
    participants?: string[]
  ): Promise<string> {
    await this.logMemoryAccess('episodic', 'new_episode', 'write', `start_${episodeType}`)
    
    const { data, error } = await this.supabase
      .from('episodes')
      .insert({
        episode_name: episodeName,
        episode_type: episodeType,
        start_time: new Date().toISOString(),
        context: context || {},
        participants: participants || [this.agentName],
        tags: []
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Error starting episode:', error)
      return ''
    }
    
    this.currentEpisodeId = data.id
    return data.id
  }

  // Record event in current episode
  async recordEvent(
    eventType: string,
    description: string,
    eventData?: any,
    inputs?: any,
    outputs?: any,
    relatedProcedureId?: string,
    episodeId?: string
  ): Promise<boolean> {
    const targetEpisodeId = episodeId || this.currentEpisodeId
    
    if (!targetEpisodeId) {
      console.error('No active episode to record event')
      return false
    }
    
    await this.logMemoryAccess('episodic', targetEpisodeId, 'write', `record_${eventType}`)
    
    // Get next event order
    const { data: lastEvent } = await this.supabase
      .from('episode_events')
      .select('event_order')
      .eq('episode_id', targetEpisodeId)
      .order('event_order', { ascending: false })
      .limit(1)
    
    const eventOrder = lastEvent && lastEvent.length > 0 ? lastEvent[0].event_order + 1 : 1
    
    const { error } = await this.supabase
      .from('episode_events')
      .insert({
        episode_id: targetEpisodeId,
        event_order: eventOrder,
        agent_name: this.agentName,
        event_type: eventType,
        event_description: description,
        event_data: eventData || {},
        inputs: inputs || {},
        outputs: outputs || {},
        related_procedure_id: relatedProcedureId
      })
    
    if (error) {
      console.error('Error recording episode event:', error)
      return false
    }
    
    return true
  }

  // End current episode
  async endEpisode(summary?: string, outcomes?: any, tags?: string[]): Promise<boolean> {
    if (!this.currentEpisodeId) {
      console.error('No active episode to end')
      return false
    }
    
    await this.logMemoryAccess('episodic', this.currentEpisodeId, 'update', 'end_episode')
    
    const { error } = await this.supabase
      .from('episodes')
      .update({
        end_time: new Date().toISOString(),
        summary: summary || '',
        outcomes: outcomes || {},
        tags: tags || []
      })
      .eq('id', this.currentEpisodeId)
    
    if (error) {
      console.error('Error ending episode:', error)
      return false
    }
    
    this.currentEpisodeId = null
    return true
  }

  // Get recent episodes
  async getRecentEpisodes(limit: number = 10, episodeType?: string): Promise<any[]> {
    await this.logMemoryAccess('episodic', 'recent_episodes', 'query', `recent_${episodeType || 'all'}`)
    
    let query = this.supabase
      .from('episodes')
      .select(`
        *,
        episode_events (
          event_type,
          event_description,
          timestamp,
          agent_name
        )
      `)
      .order('start_time', { ascending: false })
      .limit(limit)
    
    if (episodeType) {
      query = query.eq('episode_type', episodeType)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error getting recent episodes:', error)
      return []
    }
    
    return data || []
  }

  // Create system snapshot
  async createSnapshot(systemState?: any, agentStates?: any, dataChanges?: any): Promise<boolean> {
    if (!this.currentEpisodeId) {
      console.warn('No active episode for snapshot')
      return false
    }
    
    await this.logMemoryAccess('episodic', this.currentEpisodeId, 'write', 'create_snapshot')
    
    const { error } = await this.supabase
      .from('episode_snapshots')
      .insert({
        episode_id: this.currentEpisodeId,
        system_state: systemState || {},
        agent_states: agentStates || {},
        data_changes: dataChanges || {},
        memory_usage: {
          timestamp: new Date().toISOString(),
          memory_access_count: 1
        }
      })
    
    if (error) {
      console.error('Error creating episode snapshot:', error)
      return false
    }
    
    return true
  }
}

// ================================
// INTEGRATED MEMORY MANAGER
// ================================
export class CognitiveMemoryManager {
  public semantic: SemanticMemory
  public procedural: ProceduralMemory
  public episodic: EpisodicMemory
  
  constructor(agentName: string) {
    this.semantic = new SemanticMemory(agentName)
    this.procedural = new ProceduralMemory(agentName)
    this.episodic = new EpisodicMemory(agentName)
  }

  // Agent check-in with all memory bases
  async checkMemoryBases(domain?: string): Promise<{
    concepts: any[],
    procedures: any[],
    recentEpisodes: any[]
  }> {
    const [concepts, procedures, recentEpisodes] = await Promise.all([
      domain ? this.semantic.queryConceptsByDomain(domain) : [],
      this.procedural.getAgentProcedures(),
      this.episodic.getRecentEpisodes(5)
    ])
    
    return {
      concepts,
      procedures,
      recentEpisodes
    }
  }

  // Create cross-reference between memory types
  async createCrossReference(
    sourceMemoryType: string,
    sourceId: string,
    targetMemoryType: string,
    targetId: string,
    relationshipType: string,
    strength: number = 1.0
  ): Promise<boolean> {
    const supabase = this.semantic['supabase'] // Access supabase client
    
    const { error } = await supabase
      .from('memory_cross_references')
      .insert({
        source_memory_type: sourceMemoryType,
        source_id: sourceId,
        target_memory_type: targetMemoryType,
        target_id: targetId,
        relationship_type: relationshipType,
        strength
      })
    
    if (error) {
      console.error('Error creating cross-reference:', error)
      return false
    }
    
    return true
  }
}