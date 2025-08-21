#!/bin/bash

# PNG-specific optimization script that preserves transparency
echo "🖼️  Starting PNG optimization (preserving transparency)..."

# Create backup directory
BACKUP_DIR="image-backups/png_optimization_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "💾 Creating PNG backups in $BACKUP_DIR..."

# Find and optimize PNG files specifically
find public/projects -name "*.png" -o -name "*.PNG" | while read file; do
    # Get file size in bytes (macOS compatible)
    original_size=$(stat -f%z "$file")
    
    # Only process files >500KB (smaller threshold for PNGs)
    if [ $original_size -gt 500000 ]; then
        echo "🔄 Processing PNG: $file ($(numfmt --to=iec $original_size 2>/dev/null || echo "${original_size} bytes"))"
        
        # Backup original
        rel_path=$(echo "$file" | sed 's|^public/projects/||')
        backup_file="$BACKUP_DIR/$rel_path"
        backup_dir=$(dirname "$backup_file")
        mkdir -p "$backup_dir"
        cp "$file" "$backup_file"
        
        # Determine optimization settings based on size
        if [ $original_size -gt 5000000 ]; then
            # Very large PNGs (>5MB) - more aggressive
            max_width=1600
        elif [ $original_size -gt 2000000 ]; then
            # Large PNGs (>2MB) - moderate
            max_width=1600
        else
            # Medium PNGs - light optimization
            max_width=1400
        fi
        
        # Use ffmpeg with PNG output to preserve transparency
        ffmpeg -i "$file" -vf "scale='min($max_width,iw):-1'" -y "${file}_temp.png" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            # Get new size
            new_size=$(stat -f%z "${file}_temp.png")
            
            # Calculate savings
            savings=$((original_size - new_size))
            percent_savings=$((savings * 100 / original_size))
            
            # Only replace if we saved significant space (lower threshold for PNGs)
            if [ $percent_savings -gt 10 ] || [ $savings -gt 200000 ]; then
                mv "${file}_temp.png" "$file"
                echo "✅ Optimized PNG: $(numfmt --to=iec $original_size 2>/dev/null || echo "${original_size}B") → $(numfmt --to=iec $new_size 2>/dev/null || echo "${new_size}B") (-${percent_savings}%)"
            else
                rm "${file}_temp.png"
                echo "⏭️  PNG already efficient: $(numfmt --to=iec $original_size 2>/dev/null || echo "${original_size}B")"
            fi
        else
            echo "❌ Failed to process PNG: $file"
            rm -f "${file}_temp.png"
        fi
    else
        echo "⏭️  Skipping small PNG: $file ($(numfmt --to=iec $original_size 2>/dev/null || echo "${original_size}B"))"
    fi
done

echo ""
echo "🎉 PNG optimization complete!"
echo "💾 PNG backups stored in: $BACKUP_DIR"
echo "🔍 Transparency preserved for all PNG files!"
