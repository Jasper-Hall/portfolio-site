#!/bin/bash

# Image Optimization Script for Portfolio Site
# This script resizes and compresses images to web-optimized sizes

echo "🖼️  Starting image optimization..."
echo "📊 Analyzing current image sizes..."

# Create backup directory
mkdir -p image-backups
BACKUP_DIR="image-backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Find all images and show current sizes
find public/projects -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.JPG" | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "📁 $file: $size"
done

echo ""
echo "💾 Creating backups in $BACKUP_DIR..."

# Copy all images to backup
find public/projects -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.JPG" | while read file; do
    # Preserve directory structure in backup
    rel_path=$(echo "$file" | sed 's|^public/projects/||')
    backup_file="$BACKUP_DIR/$rel_path"
    backup_dir=$(dirname "$backup_file")
    mkdir -p "$backup_dir"
    cp "$file" "$backup_file"
done

echo "✅ Backups created!"
echo ""
echo "🔄 Starting optimization..."

# Optimization function
optimize_image() {
    local input_file="$1"
    local temp_file="${input_file%.???}_temp.jpg"
    
    # Get original size
    original_size=$(du -b "$input_file" | cut -f1)
    
    # Determine target dimensions based on file type and current size
    if [[ $original_size -gt 5000000 ]]; then
        # Very large files (>5MB) - resize to max 1920px width
        max_width=1920
        quality=82
    elif [[ $original_size -gt 2000000 ]]; then
        # Large files (>2MB) - resize to max 1600px width  
        max_width=1600
        quality=85
    elif [[ $original_size -gt 1000000 ]]; then
        # Medium files (>1MB) - resize to max 1200px width
        max_width=1200
        quality=88
    else
        # Smaller files - just compress with high quality
        max_width=1200
        quality=90
    fi
    
    # Use ffmpeg to resize and compress
    ffmpeg -i "$input_file" \
        -vf "scale='min($max_width,iw):-1'" \
        -q:v $quality \
        -y "$temp_file" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        # Get new size
        new_size=$(du -b "$temp_file" | cut -f1)
        
        # Calculate savings
        savings=$((original_size - new_size))
        percent_savings=$((savings * 100 / original_size))
        
        # Only replace if we saved significant space (>20% or >500KB)
        if [[ $percent_savings -gt 20 ]] || [[ $savings -gt 500000 ]]; then
            mv "$temp_file" "$input_file"
            echo "✅ $input_file: $(numfmt --to=iec $original_size) → $(numfmt --to=iec $new_size) (-${percent_savings}%)"
        else
            rm "$temp_file"
            echo "⏭️  $input_file: Already optimized ($(numfmt --to=iec $original_size))"
        fi
    else
        echo "❌ Failed to process: $input_file"
        rm -f "$temp_file"
    fi
}

# Process all images
export -f optimize_image
find public/projects -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.JPG" | while read file; do
    optimize_image "$file"
done

echo ""
echo "📊 Final size comparison:"

# Calculate total savings
original_total=0
new_total=0

find public/projects -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.JPG" | while read file; do
    rel_path=$(echo "$file" | sed 's|^public/projects/||')
    backup_file="$BACKUP_DIR/$rel_path"
    
    if [ -f "$backup_file" ]; then
        original_size=$(du -b "$backup_file" | cut -f1)
        new_size=$(du -b "$file" | cut -f1)
        original_total=$((original_total + original_size))
        new_total=$((new_total + new_size))
    fi
done > /tmp/size_calc.txt

# Read the totals (this is a workaround for bash subshell limitations)
original_total=$(find "$BACKUP_DIR" -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.JPG" -exec du -b {} + | awk '{sum += $1} END {print sum}')
new_total=$(find public/projects -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.JPG" -exec du -b {} + | awk '{sum += $1} END {print sum}')

if [ ! -z "$original_total" ] && [ ! -z "$new_total" ]; then
    savings=$((original_total - new_total))
    percent_savings=$((savings * 100 / original_total))
    
    echo "📦 Original total: $(numfmt --to=iec $original_total)"
    echo "📦 Optimized total: $(numfmt --to=iec $new_total)"
    echo "💾 Total savings: $(numfmt --to=iec $savings) (-${percent_savings}%)"
else
    echo "📦 Could not calculate total savings"
fi

echo ""
echo "🎉 Optimization complete!"
echo "💾 Backups stored in: $BACKUP_DIR"
echo "🔄 You can restore individual files from backups if needed"
echo ""
echo "🚀 Your preloader should now load much faster!"
