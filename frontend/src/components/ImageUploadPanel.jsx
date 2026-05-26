import { useEffect, useRef, useState } from 'react';

const EMPTY_ITEM = {
  name: '',
  estimated_quantity: '',
  unit: '',
  confidence: 'user',
  category: '',
  notes: '',
};

export default function ImageUploadPanel({
  analyzing,
  imageAnalysis,
  recipeLoading,
  onAnalyze,
  onAnalysisChange,
  onUseCorrected,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const chooseFile = (nextFile) => {
    if (!nextFile || !nextFile.type.startsWith('image/')) return;
    setFile(nextFile);
    onAnalysisChange([]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    chooseFile(event.dataTransfer.files?.[0]);
  };

  const analyze = () => {
    if (file) onAnalyze(file);
  };

  const updateItem = (index, field, value) => {
    onAnalysisChange(imageAnalysis.map((item, i) => (
      i === index ? { ...item, [field]: value } : item
    )));
  };

  const removeItem = (index) => {
    onAnalysisChange(imageAnalysis.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onAnalysisChange([...imageAnalysis, { ...EMPTY_ITEM }]);
  };

  return (
    <div className="upload-panel">
      <div
        className={`upload-drop ${preview ? 'upload-drop--filled' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          className="upload-input"
          type="file"
          accept="image/*"
          onChange={(event) => chooseFile(event.target.files?.[0])}
        />
        {preview ? (
          <img className="upload-preview" src={preview} alt="Selected food" />
        ) : (
          <div className="upload-empty">
            <span>📷</span>
            <p>Upload a pantry or plate photo</p>
          </div>
        )}
      </div>

      <div className="upload-actions">
        <button
          className="btn-analyze"
          onClick={analyze}
          disabled={!file || analyzing}
          type="button"
        >
          {analyzing ? <><span className="cta-spinner" /> Recognizing food...</> : 'Analyze Photo'}
        </button>
        {file && (
          <button
            className="upload-clear"
            onClick={() => {
              setFile(null);
              onAnalysisChange([]);
            }}
            type="button"
          >
            Clear
          </button>
        )}
      </div>

      {(file || imageAnalysis.length > 0) && (
        <div className="detected-box">
          <div className="analysis-head">
            <p className="quick-title">Review photo analysis</p>
            <button className="analysis-add" onClick={addItem} type="button">+ Add item</button>
          </div>
          {imageAnalysis.length === 0 ? (
            <div className="analysis-empty">
              Add ingredients manually if recognition fails or misses items.
            </div>
          ) : (
            <div className="analysis-list">
              {imageAnalysis.map((item, index) => (
                <div key={`${item.name}-${index}`} className="analysis-item">
                  <div className="analysis-main">
                    <input
                      className="analysis-name-input"
                      value={item.name || ''}
                      onChange={(event) => updateItem(index, 'name', event.target.value)}
                      placeholder="Ingredient"
                    />
                    <button className="analysis-remove" onClick={() => removeItem(index)} type="button">Remove</button>
                  </div>
                  <div className="analysis-edit-grid">
                    <input
                      className="analysis-small-input"
                      value={item.estimated_quantity || ''}
                      onChange={(event) => updateItem(index, 'estimated_quantity', event.target.value)}
                      placeholder="Qty"
                    />
                    <input
                      className="analysis-small-input"
                      value={item.unit || ''}
                      onChange={(event) => updateItem(index, 'unit', event.target.value)}
                      placeholder="Unit"
                    />
                    <select
                      className="analysis-small-input"
                      value={item.confidence || ''}
                      onChange={(event) => updateItem(index, 'confidence', event.target.value)}
                    >
                      <option value="">Confidence</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="user">User added</option>
                    </select>
                    <input
                      className="analysis-small-input"
                      value={item.category || ''}
                      onChange={(event) => updateItem(index, 'category', event.target.value)}
                      placeholder="Category"
                    />
                  </div>
                  <input
                    className="analysis-note-input"
                    value={item.notes || ''}
                    onChange={(event) => updateItem(index, 'notes', event.target.value)}
                    placeholder="Notes"
                  />
                </div>
              ))}
            </div>
          )}
          <button
            className="btn-corrected"
            onClick={onUseCorrected}
            disabled={recipeLoading || imageAnalysis.every(item => !item.name?.trim())}
            type="button"
          >
            {recipeLoading ? <><span className="cta-spinner" /> Updating recipes...</> : 'Use Corrected Analysis'}
          </button>
        </div>
      )}
    </div>
  );
}
