import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function TaskCreateView({ onClose, profileId, onTaskCreated, allTasks }) {
  console.log('TaskCreateView rendered');
  const { t } = useTranslation();
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    notes: '',
    implementationGuide: '',
    verificationCriteria: '',
    agent: '',
    dependencies: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [availableAgents, setAvailableAgents] = useState([]);

  // Load available agents on mount
  useEffect(() => {
    const loadAgents = async () => {
      if (!profileId) return;
      
      try {
        const response = await fetch(`/api/agents/combined/${profileId}`);
        if (response.ok) {
          const agents = await response.json();
          setAvailableAgents(agents);
        }
      } catch (err) {
        console.error('Error loading agents:', err);
      }
    };
    
    loadAgents();
  }, [profileId]);

  const handleInputChange = (field, value) => {
    setNewTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDependencyToggle = (taskId) => {
    setNewTask(prev => {
      const dependencies = [...prev.dependencies];
      const index = dependencies.indexOf(taskId);
      
      if (index > -1) {
        // Remove dependency
        dependencies.splice(index, 1);
      } else {
        // Add dependency
        dependencies.push(taskId);
      }
      
      return { ...prev, dependencies };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    // Validate required fields
    if (!newTask.name.trim()) {
      setError('Task name is required');
      setIsSaving(false);
      return;
    }
    
    if (!newTask.description.trim()) {
      setError('Task description is required');
      setIsSaving(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/tasks/${profileId}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create task');
      }

      const createdTask = await response.json();
      
      if (onTaskCreated) {
        onTaskCreated(createdTask);
      }
      
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  console.log('TaskCreateView: Rendering modal, showCreateTaskModal:', true);
  console.log('TaskCreateView: onClose function:', typeof onClose);
  return (
    <div className="modal-overlay" style={{zIndex: 99999, backgroundColor: 'rgba(0, 0, 0, 0.8)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={onClose}>
      <div className="modal-content task-create-modal" style={{zIndex: 100000, backgroundColor: '#16213e', borderRadius: '10px', padding: '30px', maxWidth: '500px', width: '90%', border: '2px solid #4fbdba'}} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('createTask.title')}</h2>
          <button className="close-button" onClick={onClose} title={t('close')}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="taskName">{t('taskName')} *</label>
            <input
              id="taskName"
              type="text"
              className="form-input"
              value={newTask.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('createTask.namePlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="taskDescription">{t('description')} *</label>
            <textarea
              id="taskDescription"
              className="form-textarea"
              value={newTask.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('createTask.descriptionPlaceholder')}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="taskNotes">{t('notes')}</label>
            <textarea
              id="taskNotes"
              className="form-textarea"
              value={newTask.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t('createTask.notesPlaceholder')}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="taskImplementation">{t('implementationGuide')}</label>
            <textarea
              id="taskImplementation"
              className="form-textarea"
              value={newTask.implementationGuide}
              onChange={(e) => handleInputChange('implementationGuide', e.target.value)}
              placeholder={t('createTask.implementationGuidePlaceholder')}
              rows={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="taskVerification">{t('verificationCriteria')}</label>
            <textarea
              id="taskVerification"
              className="form-textarea"
              value={newTask.verificationCriteria}
              onChange={(e) => handleInputChange('verificationCriteria', e.target.value)}
              placeholder={t('createTask.verificationCriteriaPlaceholder')}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="taskAgent">{t('assignedAgent')}</label>
            <select
              id="taskAgent"
              className="form-select"
              value={newTask.agent}
              onChange={(e) => handleInputChange('agent', e.target.value)}
            >
              <option value="">{t('createTask.agentPlaceholder')}</option>
              {availableAgents.map((agent) => {
                const agentBaseName = agent.name.replace(/\.(md|yaml|yml)$/, '');
                return (
                  <option key={agent.name} value={agentBaseName}>
                    {agentBaseName} {agent.description ? `- ${agent.description.substring(0, 100)}${agent.description.length > 100 ? '...' : ''}` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label>{t('dependencies')}</label>
            <div className="dependencies-checkboxes">
              {allTasks && allTasks.length > 0 ? (
                allTasks.map((task) => (
                  <div key={task.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`dep-${task.id}`}
                      checked={newTask.dependencies.includes(task.id)}
                      onChange={() => handleDependencyToggle(task.id)}
                    />
                    <label htmlFor={`dep-${task.id}`}>
                      {task.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="no-dependencies-message">{t('createTask.dependenciesPlaceholder')}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          {error && (
            <div className="error-message">{error}</div>
          )}
          <button 
            className="primary-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? t('creating') : t('createTask.create')}
          </button>
          <button 
            className="secondary-btn"
            onClick={onClose}
            disabled={isSaving}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskCreateView;