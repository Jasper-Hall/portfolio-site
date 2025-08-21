#!/bin/bash

# Quick Image Optimization - Simple one-liner approach
# Optimizes images >1MB to reasonable web sizes

echo "🚀 Quick image optimization starting..."

# Create backup
mkdir -p image-backups/quick-$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="image-backups/quick-$(date +%Y%m%d_%H%M%S)"

# Find and optimize large images
find public/projects -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.JPG" | while read file; do
    size=$(du -b "$file" | cut -f1)
    
    # Only process files >1MB
    if [ $size -gt 1000000 ]; then
        echo "🔄 Processing: $file ($(numfmt --to=iec $size))"
        
        # Backup original
        rel_path=$(echo "$file" | sed 's|^public/projects/||')
        backup_file="$BACKUP_DIR/$rel_path"
        backup_dir=$(dirname "$backup_file")
        mkdir -p "$backup_dir"
        cp "$file" "$backup_file"
        
        # Optimize: resize to max 1600px width, 85% quality
        ffmpeg -i "$file" -vf "scale='min(1600,iw):-1'" -q:v 85 -y "${file}_temp.jpg" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            mv "${file}_temp.jpg" "$file"
            new_size=$(du -b "$file" | cut -f1)
            savings=$((size - new_size))
            percent=$((savings * 100 / size))
            echo "✅ Optimized: $(numfmt --to=iec $size) → $(numfmt --to=iec $new_size) (-${percent}%)"
        else
            echo "❌ Failed to optimize: $file"
            rm -f "${file}_temp.jpg"
        fi
    fi
done

echo "🎉 Quick optimization complete!"
echo "💾 Backups in: $BACKUP_DIR"
