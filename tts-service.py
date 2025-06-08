#!/usr/bin/env python3
"""
Enhanced TTS Service with Anki Integration
Supports audio generation and Anki Connect operations
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pyttsx3
import io
import tempfile
import os
import requests
import json
import shutil
from pathlib import Path
import time
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["app://obsidian.md", "capacitor://localhost", "http://localhost"])

# Initialize TTS engine
try:
    tts_engine = pyttsx3.init()
    # Set voice properties
    voices = tts_engine.getProperty('voices')
    if voices:
        # Try to set English voice
        for voice in voices:
            if 'english' in voice.name.lower() or 'en' in voice.id.lower():
                tts_engine.setProperty('voice', voice.id)
                break
    
    tts_engine.setProperty('rate', 180)  # Speed
    tts_engine.setProperty('volume', 0.9)  # Volume
    
    logger.info("TTS engine initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize TTS engine: {e}")
    tts_engine = None

# Anki Connect settings
ANKI_CONNECT_URL = "http://localhost:8765"
ANKI_MEDIA_FOLDER = None

def get_anki_media_folder():
    """Get Anki media folder path"""
    global ANKI_MEDIA_FOLDER
    if ANKI_MEDIA_FOLDER:
        return ANKI_MEDIA_FOLDER
    
    try:
        # Try to get media folder from Anki
        response = requests.post(ANKI_CONNECT_URL, json={
            "action": "getMediaDirPath",
            "version": 6
        })
        
        if response.status_code == 200:
            data = response.json()
            if 'result' in data and data['result']:
                ANKI_MEDIA_FOLDER = data['result']
                logger.info(f"Anki media folder: {ANKI_MEDIA_FOLDER}")
                return ANKI_MEDIA_FOLDER
    except Exception as e:
        logger.error(f"Failed to get Anki media folder: {e}")
    
    return None

def anki_request(action, **params):
    """Make request to Anki Connect"""
    try:
        response = requests.post(ANKI_CONNECT_URL, json={
            "action": action,
            "version": 6,
            "params": params
        })
        
        if response.status_code == 200:
            data = response.json()
            if data.get('error'):
                raise Exception(data['error'])
            return data.get('result')
        else:
            raise Exception(f"HTTP {response.status_code}")
    except Exception as e:
        logger.error(f"Anki request failed: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "tts_available": tts_engine is not None,
        "anki_available": check_anki_connection(),
        "timestamp": time.time()
    })

def check_anki_connection():
    """Check if Anki Connect is available"""
    try:
        result = anki_request("version")
        return result == 6
    except:
        return False

@app.route('/synthesize', methods=['POST'])
def synthesize():
    """Generate TTS audio"""
    if not tts_engine:
        return jsonify({"error": "TTS engine not available"}), 500
    
    try:
        data = request.get_json()
        text = data.get('text', '')
        voice = data.get('voice', 'en-us')
        quality = data.get('quality', 'high')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        logger.info(f"Generating TTS for: {text[:50]}...")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            temp_path = temp_file.name
        
        try:
            # Configure TTS settings based on quality
            if quality == 'high':
                tts_engine.setProperty('rate', 160)
            elif quality == 'medium':
                tts_engine.setProperty('rate', 180)
            else:  # low
                tts_engine.setProperty('rate', 200)
            
            # Generate audio
            tts_engine.save_to_file(text, temp_path)
            tts_engine.runAndWait()
            
            # Read the generated file
            with open(temp_path, 'rb') as f:
                audio_data = f.read()
            
            # Clean up
            os.unlink(temp_path)
            
            if len(audio_data) < 1000:
                raise Exception("Generated audio too small")
            
            logger.info(f"TTS generated successfully: {len(audio_data)} bytes")
            
            # Return audio file
            return send_file(
                io.BytesIO(audio_data),
                mimetype='audio/wav',
                as_attachment=True,
                download_name='audio.wav'
            )
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            raise e
            
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        return jsonify({"error": str(e)}), 500

# Anki Integration Endpoints

@app.route('/anki/test', methods=['GET'])
def test_anki():
    """Test Anki Connect connection with detailed diagnostics"""
    try:
        # Test basic connection
        version = anki_request("version")
        
        # Test additional functionality
        decks = anki_request("deckNames")
        note_types = anki_request("modelNames")
        media_folder = get_anki_media_folder()
        
        return jsonify({
            "success": True,
            "version": version,
            "decks_count": len(decks) if decks else 0,
            "note_types_count": len(note_types) if note_types else 0,
            "media_folder": media_folder,
            "anki_connect_available": True
        })
    except Exception as e:
        logger.error(f"Anki test failed: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "anki_connect_available": False,
            "troubleshooting": {
                "step1": "Make sure Anki desktop is running",
                "step2": "Install AnkiConnect addon (code: 2055492159)",
                "step3": "Restart Anki after installing addon",
                "step4": "Check if port 8765 is not blocked"
            }
        }), 500

@app.route('/anki/decks', methods=['GET'])
def get_decks():
    """Get available Anki decks with error handling"""
    try:
        decks = anki_request("deckNames")
        if not decks:
            decks = ["Default"]  # Fallback
        return jsonify(decks)
    except Exception as e:
        logger.error(f"Failed to get decks: {e}")
        # Return fallback decks instead of error
        return jsonify(["Default", "IELTS"])

@app.route('/anki/note-types', methods=['GET'])
def get_note_types():
    """Get available note types with error handling"""
    try:
        note_types = anki_request("modelNames")
        if not note_types:
            note_types = ["Basic", "English Vocabulary"]  # Fallback
        return jsonify(note_types)
    except Exception as e:
        logger.error(f"Failed to get note types: {e}")
        # Return fallback note types
        return jsonify(["Basic", "English Vocabulary", "Advance"])

@app.route('/anki/fields/<note_type>', methods=['GET'])
def get_fields(note_type):
    """Get fields for a note type with enhanced error handling and smart defaults"""
    try:
        fields = anki_request("modelFieldNames", modelName=note_type)
        
        if not fields or len(fields) == 0:
            # Return smart defaults based on note type name
            fields = get_default_fields_for_note_type(note_type)
            logger.warning(f"No fields found for {note_type}, using defaults: {fields}")
        
        return jsonify(fields)
    except Exception as e:
        logger.error(f"Failed to get fields for {note_type}: {e}")
        
        # Return smart defaults based on note type name
        fields = get_default_fields_for_note_type(note_type)
        return jsonify(fields)

def get_default_fields_for_note_type(note_type):
    """Get default fields based on note type name pattern"""
    note_type_lower = note_type.lower()
    
    if 'english' in note_type_lower and 'vocabulary' in note_type_lower:
        # Perfect match for English Vocabulary note type
        return ['Term', 'Definition', 'Type', 'Examples', 'Vietnamese', 'IPA', 'Synonyms', 'Antonyms', 'Audio_Term', 'Source', 'ID']
    elif note_type_lower == 'advance':
        # Advance note type có đầy đủ vocabulary fields
        return ['Term', 'Definition', 'Type', 'Examples', 'Vietnamese', 'IPA', 'Synonyms', 'Antonyms', 'Audio_Term', 'Source', 'ID']
    elif 'vocabulary' in note_type_lower or 'language' in note_type_lower:
        # Other vocabulary note types
        return ['Term', 'Definition', 'Vietnamese', 'Audio_Term', 'Examples']
    else:
        # Basic and other simple note types
        return ['Front', 'Back']

@app.route('/anki/add-note', methods=['POST'])
def add_note():
    """Add note to Anki with enhanced audio support and debugging"""
    try:
        data = request.get_json()
        deck = data.get('deck')
        note_type = data.get('noteType')
        fields = data.get('fields', {})
        tags = data.get('tags', [])
        existing_audio_files = data.get('existingAudioFiles', {})
        vault_path = data.get('vaultPath', '')
        
        logger.info(f"Creating Anki note with {len(existing_audio_files)} audio files")
        logger.info(f"Vault path: {vault_path}")
        
        # Get Anki media folder
        media_folder = get_anki_media_folder()
        
        if not media_folder:
            logger.error("Cannot get Anki media folder")
            return jsonify({
                "success": False,
                "error": "Cannot access Anki media folder"
            }), 500
        
        copied_files = []
        failed_files = []
        
        # Handle existing audio files with enhanced path resolution
        if existing_audio_files:
            for field_name, audio_info in existing_audio_files.items():
                try:
                    filename = audio_info.get('filename')
                    obsidian_path = audio_info.get('obsidianPath')
                    
                    if not filename:
                        continue
                        
                    logger.info(f"Processing audio file: {filename}")
                    
                    # Enhanced path resolution
                    possible_paths = []
                    
                    # Add vault-based paths if available
                    if vault_path:
                        vault_audio_path = Path(vault_path) / "Audio" / filename
                        possible_paths.append(vault_audio_path)
                        
                    if obsidian_path:
                        # Direct path
                        possible_paths.append(Path(obsidian_path))
                        # Vault + obsidian path
                        if vault_path:
                            possible_paths.append(Path(vault_path) / obsidian_path)
                    
                    # Add current working directory paths
                    current_dir = Path.cwd()
                    possible_paths.extend([
                        current_dir / "Audio" / filename,
                        current_dir / filename,
                        current_dir.parent / "Audio" / filename,
                    ])
                    
                    # Find the actual file
                    source_path = None
                    for path in possible_paths:
                        try:
                            if path.exists() and path.is_file() and path.stat().st_size > 1000:
                                source_path = path
                                logger.info(f"Found audio file at: {source_path}")
                                break
                        except Exception:
                            continue
                    
                    if source_path:
                        dest_path = Path(media_folder) / filename
                        
                        # Copy file
                        shutil.copy2(source_path, dest_path)
                        
                        # Verify copy
                        if dest_path.exists() and dest_path.stat().st_size > 1000:
                            copied_files.append({
                                "filename": filename,
                                "source": str(source_path),
                                "size": dest_path.stat().st_size
                            })
                            logger.info(f"Successfully copied: {filename} ({dest_path.stat().st_size} bytes)")
                        else:
                            failed_files.append(f"{filename} (copy verification failed)")
                    else:
                        failed_files.append(f"{filename} (not found in {len(possible_paths)} locations)")
                        logger.error(f"Audio file not found: {filename}")
                        logger.error(f"Searched paths: {[str(p) for p in possible_paths[:5]]}")
                        
                except Exception as e:
                    failed_files.append(f"{filename} (error: {str(e)})")
                    logger.error(f"Failed to process audio file {filename}: {e}")
        
        # Extract and copy audio files from [sound:filename] format in fields
        for field_name, field_value in fields.items():
            if isinstance(field_value, str) and '[sound:' in field_value:
                import re
                sound_matches = re.findall(r'\[sound:([^\]]+)\]', field_value)
                
                for sound_filename in sound_matches:
                    if sound_filename not in [af.get('filename') for af in existing_audio_files.values()]:
                        # This is a new audio file mentioned in fields
                        try:
                            # Search for this file
                            search_paths = [
                                Path(vault_path) / "Audio" / sound_filename if vault_path else None,
                                Path.cwd() / "Audio" / sound_filename,
                                Path.cwd().parent / "Audio" / sound_filename,
                            ]
                            search_paths = [p for p in search_paths if p is not None]
                            
                            source_audio_path = None
                            for path in search_paths:
                                if path.exists() and path.stat().st_size > 1000:
                                    source_audio_path = path
                                    break
                            
                            if source_audio_path:
                                dest_audio_path = Path(media_folder) / sound_filename
                                if not dest_audio_path.exists():
                                    shutil.copy2(source_audio_path, dest_audio_path)
                                    copied_files.append({
                                        "filename": sound_filename,
                                        "source": str(source_audio_path),
                                        "size": dest_audio_path.stat().st_size
                                    })
                                    logger.info(f"Copied field audio: {sound_filename}")
                            else:
                                failed_files.append(f"{sound_filename} (field reference not found)")
                                
                        except Exception as e:
                            failed_files.append(f"{sound_filename} (field error: {str(e)})")
        
        # Create the note
        note_id = anki_request("addNote", note={
            "deckName": deck,
            "modelName": note_type,
            "fields": fields,
            "tags": tags
        })
        
        return jsonify({
            "success": True,
            "noteId": note_id,
            "media_folder": media_folder,
            "copied_files": copied_files,
            "failed_files": failed_files,
            "total_copied": len(copied_files),
            "total_failed": len(failed_files)
        })
        
    except Exception as e:
        logger.error(f"Failed to add note: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Add endpoint to manually copy audio files
@app.route('/anki/copy-audio', methods=['POST'])
def copy_audio_to_anki():
    """Manually copy audio file to Anki media folder with enhanced path detection"""
    try:
        data = request.get_json()
        audio_filename = data.get('filename')
        
        if not audio_filename:
            return jsonify({"success": False, "error": "No filename provided"}), 400
        
        media_folder = get_anki_media_folder()
        if not media_folder:
            return jsonify({"success": False, "error": "Cannot access Anki media folder"}), 500
        
        # Enhanced path detection - try multiple possible locations
        possible_paths = []
        
        # Get current working directory and common Obsidian vault locations
        current_dir = Path.cwd()
        
        # Add various possible paths
        possible_paths.extend([
            # Current directory and subdirectories
            current_dir / "Audio" / audio_filename,
            current_dir / audio_filename,
            
            # Parent directories
            current_dir.parent / "Audio" / audio_filename,
            current_dir.parent / audio_filename,
            
            # Common Obsidian vault locations
            Path.home() / "Documents" / "Obsidian Vault" / "Audio" / audio_filename,
            Path.home() / "Desktop" / "Obsidian" / "Audio" / audio_filename,
            
            # Plugin directory relative paths
            Path(__file__).parent / "Audio" / audio_filename,
            Path(__file__).parent.parent / "Audio" / audio_filename,
            
            # Absolute path patterns
            Path("D:/") / "Python" / "LLM_anki" / "Audio" / audio_filename,
            Path("C:/") / "Users" / Path.home().name / "Documents" / "Audio" / audio_filename,
        ])
        
        # Also try to find any file with the same name in the system
        try:
            # Search in current directory tree
            for root, dirs, files in os.walk(current_dir):
                if audio_filename in files:
                    possible_paths.append(Path(root) / audio_filename)
                    
            # Search in parent directory tree (limited depth)
            parent_search_root = current_dir.parent
            search_depth = 0
            for root, dirs, files in os.walk(parent_search_root):
                if search_depth > 3:  # Limit search depth
                    break
                if audio_filename in files:
                    possible_paths.append(Path(root) / audio_filename)
                search_depth += 1
                    
        except Exception as search_error:
            logger.warning(f"File search failed: {search_error}")
        
        # Try each possible path
        source_path = None
        for path in possible_paths:
            try:
                if path.exists() and path.is_file():
                    # Verify it's actually an audio file
                    if path.stat().st_size > 1000:  # At least 1KB
                        source_path = path
                        logger.info(f"Found audio file at: {source_path}")
                        break
            except Exception as e:
                continue
        
        if not source_path:
            # Log all attempted paths for debugging
            logger.error(f"Audio file not found: {audio_filename}")
            logger.error(f"Searched in {len(possible_paths)} locations:")
            for i, path in enumerate(possible_paths[:10]):  # Log first 10 paths
                logger.error(f"  {i+1}. {path} (exists: {path.exists() if hasattr(path, 'exists') else 'unknown'})")
                
            return jsonify({
                "success": False, 
                "error": f"Audio file not found: {audio_filename}",
                "searched_paths": [str(p) for p in possible_paths[:10]],
                "current_dir": str(current_dir),
                "suggestions": [
                    "Make sure to click 'Save Note' first to generate audio files",
                    "Check if Audio folder exists in your Obsidian vault",
                    "Verify TTS service is generating files correctly"
                ]
            }), 404
        
        # Copy to Anki media folder
        dest_path = Path(media_folder) / audio_filename
        
        try:
            # Ensure destination directory exists
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Copy the file
            shutil.copy2(source_path, dest_path)
            
            # Verify the copy
            if dest_path.exists():
                file_size = dest_path.stat().st_size
                source_size = source_path.stat().st_size
                
                if file_size == source_size and file_size > 1000:
                    logger.info(f"Successfully copied audio: {source_path} -> {dest_path} ({file_size} bytes)")
                    return jsonify({
                        "success": True,
                        "message": f"Audio file copied successfully",
                        "source": str(source_path),
                        "destination": str(dest_path),
                        "size": file_size
                    })
                else:
                    raise Exception(f"File copy verification failed: source={source_size}, dest={file_size}")
            else:
                raise Exception("Destination file does not exist after copy")
                
        except Exception as copy_error:
            logger.error(f"Copy operation failed: {copy_error}")
            return jsonify({
                "success": False, 
                "error": f"Copy failed: {copy_error}",
                "source": str(source_path),
                "destination": str(dest_path)
            }), 500
        
    except Exception as e:
        logger.error(f"Failed to copy audio: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/anki/check-audio/<filename>', methods=['GET'])
def check_audio_file(filename):
    """Check if audio file exists in various locations with enhanced detection"""
    try:
        media_folder = get_anki_media_folder()
        current_dir = Path.cwd()
        
        locations = {
            "anki_media": None,
            "obsidian_audio": [],
            "found_paths": [],
            "search_info": {
                "current_dir": str(current_dir),
                "media_folder": media_folder
            }
        }
        
        # Check Anki media folder
        if media_folder:
            anki_path = Path(media_folder) / filename
            if anki_path.exists():
                locations["anki_media"] = {
                    "path": str(anki_path),
                    "size": anki_path.stat().st_size,
                    "exists": True
                }
            else:
                locations["anki_media"] = {"exists": False, "path": str(anki_path)}
        
        # Enhanced search for Obsidian audio files
        search_paths = [
            current_dir / "Audio" / filename,
            current_dir / filename,
            current_dir.parent / "Audio" / filename,
            Path(__file__).parent / "Audio" / filename,
            Path(__file__).parent.parent / "Audio" / filename,
        ]
        
        for path in search_paths:
            try:
                if path.exists() and path.is_file():
                    file_info = {
                        "path": str(path),
                        "size": path.stat().st_size,
                        "exists": True,
                        "type": "direct_search"
                    }
                    locations["obsidian_audio"].append(file_info)
                    locations["found_paths"].append(file_info)
            except Exception as e:
                continue
        
        # Directory traversal search (limited)
        try:
            search_roots = [current_dir, current_dir.parent]
            for root_path in search_roots:
                for root, dirs, files in os.walk(root_path):
                    # Limit search depth
                    depth = len(Path(root).relative_to(root_path).parts)
                    if depth > 3:
                        continue
                        
                    if filename in files:
                        file_path = Path(root) / filename
                        if file_path.stat().st_size > 1000:  # Valid audio file
                            file_info = {
                                "path": str(file_path),
                                "size": file_path.stat().st_size,
                                "exists": True,
                                "type": "traversal_search"
                            }
                            locations["found_paths"].append(file_info)
                            
        except Exception as search_error:
            locations["search_info"]["search_error"] = str(search_error)
        
        return jsonify({
            "filename": filename,
            "locations": locations,
            "total_found": len(locations["found_paths"])
        })
        
    except Exception as e:
        logger.error(f"Failed to check audio file: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🎙️ LLM Dictionary TTS Service with Anki Integration")
    print("📡 Starting server on http://localhost:6789")
    print("🃏 Make sure Anki is running with AnkiConnect addon")
    print("🎵 Audio files will be automatically managed")
    print("---")
    
    app.run(host='0.0.0.0', port=6789, debug=False)